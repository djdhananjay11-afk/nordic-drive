import argparse
from collections import deque
from datetime import date, datetime, timezone
import json
import multiprocessing
import os
from pathlib import Path
import re
import sys
from urllib.parse import urljoin, urlsplit
import xml.etree.ElementTree as ET

from .database import connection_settings, insert_rows
from .extract import evidence, parse_html, parse_pdf
from .network import Client, FetchError, Source

ROOT = Path(__file__).resolve().parents[1]
RELEVANT = re.compile(r"modell|model|bil|car|elektr|electric|spec|teknisk|technical|"
                      r"prisliste|bro[sj]|price|produkt|product|warranty|garanti|\.pdf$", re.I)
EXCLUDED = re.compile(r"/(login|account|admin|cart|checkout|privacy|personvern|cookies|search)(/|$)", re.I)


def write_json(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(".tmp")
    temporary.write_text(json.dumps(value, ensure_ascii=True, indent=2, allow_nan=False) + "\n", encoding="utf-8")
    temporary.replace(path)


def load_sources(path: Path) -> list[Source]:
    data = json.loads(path.read_text(encoding="utf-8"))
    sources = []
    for item in data:
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", item["slug"]):
            raise ValueError("Invalid source slug.")
        source = Source(item["slug"], item["name"], tuple(item["allowedHosts"]),
                        tuple(item["pathPrefixes"]), tuple(item["seedUrls"]), item["enabled"])
        for seed in source.seeds:
            source.accepts(seed)
        sources.append(source)
    if len({source.slug for source in sources}) != len(sources):
        raise ValueError("Duplicate source slug.")
    return sources


def sitemap_links(body: bytes) -> tuple[list[str], bool]:
    if b"<!DOCTYPE" in body.upper() or b"<!ENTITY" in body.upper():
        raise ValueError("xml_entities_not_allowed")
    root = ET.fromstring(body)
    locations = [node.text.strip() for node in root.iter()
                 if node.tag.split("}")[-1] == "loc" and node.text]
    return locations[:5000], root.tag.split("}")[-1] == "sitemapindex"


def pdf_worker(body: bytes, connection):
    try:
        connection.send((True, parse_pdf(body)))
    except Exception:
        connection.send((False, "pdf_parse_failed"))
    finally:
        connection.close()


def bounded_pdf(body: bytes) -> dict:
    context = multiprocessing.get_context("spawn")
    parent, child = context.Pipe(duplex=False)
    process = context.Process(target=pdf_worker, args=(body, child), daemon=True)
    process.start()
    child.close()
    try:
        if not parent.poll(30):
            raise ValueError("pdf_parse_timeout")
        success, result = parent.recv()
        if not success:
            raise ValueError(result)
        return result
    finally:
        if process.is_alive():
            process.terminate()
        process.join()
        parent.close()


def crawl(source: Source, args) -> dict:
    report = {"brand": source.slug, "pages": [], "completeness": "PARTIAL", "queuedRemaining": 0}
    if not source.enabled:
        report["status"] = "NORWAY_UNCONFIRMED_SKIPPED"
        return report
    client = Client(source, args.contact, args.delay)
    queue = deque((url, 0) for url in source.seeds)
    queued = set(source.seeds)
    visited = set()
    today = datetime.now(timezone.utc).date().isoformat()

    def enqueue(url: str, depth: int):
        try:
            url = source.accepts(url)
        except (ValueError, FetchError):
            return
        if url not in queued and len(queued) < 5000 and not EXCLUDED.search(urlsplit(url).path):
            queued.add(url)
            queue.append((url, depth))

    try:
        policy = client.policy(source.seeds[0])
        maps = deque(policy.site_maps() or [urljoin(source.seeds[0], "/sitemap.xml")])
        seen_maps = set()
        while maps and len(seen_maps) < args.max_sitemaps:
            url = maps.popleft()
            if url in seen_maps:
                continue
            seen_maps.add(url)
            try:
                response = client.get(url, control=True)
                links, nested = sitemap_links(response.body)
                if nested:
                    maps.extend(links)
                else:
                    for link in links:
                        if RELEVANT.search(link):
                            enqueue(link, 1)
            except (FetchError, ValueError, ET.ParseError):
                report.setdefault("warnings", []).append("sitemap_unavailable_or_out_of_scope")
                if client.stopped:
                    break
    except FetchError as error:
        report.update(status=str(error), queuedRemaining=len(queue))
        return report

    while queue and len(visited) < args.max_pages and not client.stopped:
        url, depth = queue.popleft()
        if url in visited:
            continue
        visited.add(url)
        entry = {"url": url}
        try:
            response = client.get(url)
            if response.mime == "application/pdf":
                if not args.pdf:
                    entry["status"] = "PDF_REQUIRES_OPT_IN"
                    report["pages"].append(entry)
                    continue
                extracted = bounded_pdf(response.body)
                links = []
            elif response.mime in ("text/html", "application/xhtml+xml"):
                extracted, links = parse_html(response.body, response.url, response.charset)
            else:
                raise FetchError("unsupported_content_type")
            if depth < args.max_depth:
                # Prioritize technical pages, but also follow model names without generic URL keywords.
                for link in sorted(links, key=lambda value: not bool(RELEVANT.search(value))):
                    enqueue(link, depth + 1)
            count = sum(len(extracted.get(key, [])) for key in ("vehicles", "tables", "definitions", "snippets", "pdfLines"))
            if count:
                row = evidence(source.slug, response.url, extracted, today, response.body)
                if len(json.dumps(row, ensure_ascii=True).encode()) > 3 * 1024 * 1024:
                    raise FetchError("observation_size_limit")
                write_json(args.output / "records" / (row["contentHash"] + ".json"), row)
                entry.update(status="COLLECTED_PENDING", evidenceGroups=count, contentHash=row["contentHash"])
            else:
                entry["status"] = "NO_SPECIFICATIONS_FOUND"
        except FetchError as error:
            entry["status"] = str(error)
        except ValueError as error:
            if str(error) == "access_challenge":
                client.stopped = True
                entry["status"] = "ACCESS_CHALLENGE_HOST_STOPPED"
            else:
                entry["status"] = "EXTRACTION_FAILED_REVIEW_REQUIRED"
        except Exception:
            # Do not echo arbitrary HTML, parser traces, URLs with secrets, or database errors.
            entry["status"] = "EXTRACTION_FAILED_REVIEW_REQUIRED"
        report["pages"].append(entry)
        print(json.dumps({"brand": source.slug, **entry}), flush=True)
        write_json(args.output / "reports" / (source.slug + ".json"), report)
    report.update(status="HOST_STOPPED" if client.stopped else "FINISHED_BOUNDED_CRAWL",
                  queuedRemaining=len(queue), attempted=len(visited))
    return report


def validate_import_row(row: dict, sources: dict[str, Source]) -> None:
    source = sources[row["brandSlug"]]
    if not source.enabled:
        raise ValueError("Cannot import disabled source.")
    source.accepts(row["sourceUrl"])
    if date.fromisoformat(row["observedOn"]) > datetime.now(timezone.utc).date():
        raise ValueError("Future observation date.")
    payload = row["payload"]
    if (payload.get("kind") != "SCRAPED_PAGE_OBSERVATION" or payload.get("schemaVersion") != 1
            or payload.get("extractorVersion") != 1 or payload.get("completeness") != "PARTIAL"
            or row.get("market") != "NO" or row.get("modelName") is not None or row.get("variantName") is not None):
        raise ValueError("Unsupported or modified observation format.")
    expected = evidence(row["brandSlug"], row["sourceUrl"], payload["extracted"], row["observedOn"], b"")
    if any(row[key] != expected[key] for key in ("contentHash", "batchId", "recordKey")):
        raise ValueError("Observation integrity check failed.")


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="Official Norway catalogue collector (not an automatic publisher).")
    parser.add_argument("--sources", type=Path, default=ROOT / "sources.json")
    commands = parser.add_subparsers(dest="command", required=True)
    collect = commands.add_parser("crawl")
    collect.add_argument("--brand", action="append", help="Repeat to limit brands; omitted means all configured brands.")
    collect.add_argument("--contact", required=True, help="Real operator email or project contact URL for the User-Agent.")
    collect.add_argument("--max-pages", type=int, default=20)
    collect.add_argument("--max-depth", type=int, default=3)
    collect.add_argument("--max-sitemaps", type=int, default=3)
    collect.add_argument("--delay", type=float, default=3)
    collect.add_argument("--pdf", action="store_true")
    collect.add_argument("--output", type=Path, default=ROOT / "runs" / datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ"))
    commands.add_parser("list")
    importer = commands.add_parser("import")
    importer.add_argument("--input", required=True, type=Path)
    importer.add_argument("--apply", action="store_true")
    importer.add_argument("--environment", choices=["staging"])
    importer.add_argument("--target")
    args = parser.parse_args(argv)
    sources = load_sources(args.sources)
    if args.command == "list":
        print(json.dumps([{"brand": source.slug, "enabled": source.enabled, "seeds": len(source.seeds)} for source in sources], indent=2))
        return 0
    if args.command == "crawl":
        if not (re.fullmatch(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", args.contact)
                or re.fullmatch(r"https://[A-Za-z0-9.-]+(?:/[A-Za-z0-9/_-]*)?", args.contact)):
            parser.error("--contact must be an operator email address or HTTPS contact URL.")
        if not (1 <= args.max_pages <= 500 and 0 <= args.max_depth <= 8 and 0 <= args.max_sitemaps <= 10 and 3 <= args.delay <= 120):
            parser.error("Use pages 1..500, depth 0..8, sitemaps 0..10, delay 3..120 seconds.")
        if args.brand and set(args.brand) - {source.slug for source in sources}:
            parser.error("Unknown brand; use the list command.")
        selected = [source for source in sources if not args.brand or source.slug in args.brand]
        reports = []
        for source in selected:
            report = crawl(source, args)
            reports.append(report)
            write_json(args.output / "reports" / (source.slug + ".json"), report)
            write_json(args.output / "report.json", {"completeness": "PARTIAL", "brands": reports})
        print(f"Reports: {args.output.resolve()} (not a complete or verified catalogue)")
        return 0 if any(page.get("status") == "COLLECTED_PENDING" for report in reports for page in report["pages"]) else 2
    files = sorted((args.input / "records").glob("*.json"))
    if not files or len(files) > 10000:
        parser.error("Expected 1..10000 records in --input/records.")
    if sum(path.stat().st_size for path in files) > 64 * 1024 * 1024:
        parser.error("Import exceeds 64 MiB; split into smaller batches.")
    rows = []
    for path in files:
        if path.stat().st_size > 4 * 1024 * 1024:
            parser.error("Observation exceeds 4 MiB.")
        row = json.loads(path.read_text(encoding="utf-8"))
        validate_import_row(row, {source.slug: source for source in sources})
        rows.append(row)
    if not args.apply:
        print(f"DRY RUN: validated {len(rows)} observations; no database connection.")
        return 0
    settings = connection_settings(os.environ.get("SCRAPER_DATABASE_URL", ""), args.target, args.environment)
    count = insert_rows(rows, settings)
    print(f"Inserted {count}; existing {len(rows) - count}. PENDING only; published cars unchanged.")
    return 0


def run():
    try:
        return main()
    except KeyboardInterrupt:
        print("Stopped. Completed observations remain on disk.", file=sys.stderr)
        return 130
    except Exception as error:
        print(f"Operation failed ({type(error).__name__}). Check configuration, report and staging schema; credentials suppressed.", file=sys.stderr)
        return 1
