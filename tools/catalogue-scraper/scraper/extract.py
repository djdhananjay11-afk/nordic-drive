"""Keep labels, column headings and qualifiers; never guess a trim or unit."""

import hashlib
import io
import json
import re
from urllib.parse import urljoin

from bs4 import BeautifulSoup
from pypdf import PdfReader

SPEC = re.compile(
    r"wltp|rekkevidde|range|batter|kwh|lading|ladeeffekt|charging|"
    r"0\s*[-\u2013]\s*100|akselerasjon|acceleration|dreiemoment|torque|"
    r"hestekrefter|horsepower|motoreffekt|drivlinje|drivetrain|"
    r"bagasje|luggage|towing|hengervekt|tilheng|bakkeklaring|ground clearance|"
    r"akselavstand|wheelbase|lengde|length|bredde|width|h\u00f8yde|height|"
    r"garanti|warranty|forbruk|consumption|egenvekt|nyttelast|vekt|"
    r"pris|price|seter|seats|varmepumpe|heat pump|v2l|sikkerhet|safety",
    re.I,
)
CHALLENGE = re.compile(r"just a moment|verify you are human|access denied|captcha|checking your browser", re.I)


def clean(value: str, limit: int = 1200) -> str:
    return " ".join(value.split())[:limit]


def json_nodes(value, depth=0):
    if depth > 16:
        return
    if isinstance(value, dict):
        yield value
        for child in value.values():
            yield from json_nodes(child, depth + 1)
    elif isinstance(value, list):
        for child in value:
            yield from json_nodes(child, depth + 1)


def parse_html(body: bytes, url: str, charset="utf-8") -> tuple[dict, list[str]]:
    soup = BeautifulSoup(body.decode(charset, errors="replace"), "html.parser")
    title = clean(soup.title.get_text(" ") if soup.title else "")
    heading = clean(soup.h1.get_text(" ") if soup.h1 else "")
    if CHALLENGE.search(title + " " + heading):
        raise ValueError("access_challenge")
    structured = []
    warnings = []
    vehicle_types = {"Car", "Vehicle"}
    allowed_keys = {
        "@type", "name", "model", "vehicleConfiguration", "vehicleModelDate", "brand",
        "fuelType", "vehicleEngine", "driveWheelConfiguration", "numberOfDoors",
        "vehicleSeatingCapacity", "bodyType", "weight", "width", "height", "depth",
        "speed", "accelerationTime", "offers", "additionalProperty", "image", "url",
    }
    for script in soup.select('script[type="application/ld+json"]')[:40]:
        try:
            data = json.loads(script.get_text())
            for node in json_nodes(data):
                types = node.get("@type", [])
                types = [types] if isinstance(types, str) else types
                if not isinstance(types, list) or not any(t in vehicle_types for t in types if isinstance(t, str)):
                    continue
                structured.append({key: value for key, value in node.items() if key in allowed_keys})
        except (ValueError, RecursionError):
            warnings.append("invalid_json_ld")
    # Preserve the full header row: multiple variants must not collapse into one figure.
    tables = []
    for table in soup.find_all("table")[:60]:
        rows = [[clean(cell.get_text(" ")) for cell in row.find_all(["th", "td"], recursive=False)]
                for row in table.find_all("tr")[:200]]
        rows = [row for row in rows if row]
        if rows and SPEC.search(json.dumps(rows, ensure_ascii=False)):
            caption = table.find("caption")
            tables.append({"caption": clean(caption.get_text(" ")) if caption else "", "rows": rows})
    definitions = []
    for term in soup.find_all("dt")[:300]:
        description = term.find_next_sibling()
        if description and description.name == "dd" and SPEC.search(term.get_text(" ")):
            definitions.append({"label": clean(term.get_text(" ")), "value": clean(description.get_text(" "))})
    snippets = []
    for node in soup.select("p, li"):
        text = clean(node.get_text(" "), 500)
        if SPEC.search(text) and re.search(r"\d", text) and text not in snippets:
            snippets.append(text)
        if len(snippets) >= 100:
            warnings.append("snippet_limit")
            break
    links = list(dict.fromkeys(urljoin(url, str(a["href"])) for a in soup.select("a[href]")))[:3000]
    images = []
    for node in soup.select('meta[property="og:image"], img[src]')[:200]:
        src = node.get("content") or node.get("src")
        if src:
            candidate = urljoin(url, str(src))
            if candidate.startswith("https://") and candidate not in [item["url"] for item in images]:
                images.append({"url": candidate, "alt": clean(str(node.get("alt", ""))),
                               "rightsStatus": "UNVERIFIED", "visualStatus": "NOT_INSPECTED"})
    warnings.extend(["BEV_AND_NORWAY_AVAILABILITY_NOT_VERIFIED", "VARIANT_MAPPING_REQUIRED",
                     "IMAGE_REUSE_NOT_AUTHORIZED"])
    if not (structured or tables or definitions or snippets):
        warnings.append("NO_SPECIFICATIONS_FOUND_POSSIBLY_JAVASCRIPT_ONLY")
    return {"title": title, "heading": heading, "vehicles": structured[:100], "tables": tables,
            "definitions": definitions, "snippets": snippets, "mediaCandidates": images,
            "warnings": warnings}, links


def parse_pdf(body: bytes) -> dict:
    reader = PdfReader(io.BytesIO(body))
    if reader.is_encrypted:
        raise ValueError("encrypted_pdf")
    lines = []
    for index, page in enumerate(reader.pages[:40]):
        text = page.extract_text() or ""
        for line in text.splitlines():
            if SPEC.search(line):
                lines.append({"page": index + 1, "text": clean(line)})
                if len(lines) >= 500:
                    break
        if len(lines) >= 500:
            break
    return {"pdfLines": lines, "warnings": ["PDF_LAYOUT_AND_VARIANT_REVIEW_REQUIRED",
            "PDF_SCAN_OCR_NOT_SUPPORTED"] + (["PDF_PAGE_LIMIT"] if len(reader.pages) > 40 else [])}


def evidence(brand: str, url: str, extracted: dict, observed_on: str, body: bytes) -> dict:
    payload = {"schemaVersion": 1, "kind": "SCRAPED_PAGE_OBSERVATION", "extractorVersion": 1,
               "completeness": "PARTIAL", "sourceSha256": hashlib.sha256(body).hexdigest(),
               "extracted": extracted}
    row = {"recordKey": f"{brand}/page/{hashlib.sha256(url.encode()).hexdigest()[:24]}",
           "brandSlug": brand, "modelName": None, "variantName": None, "market": "NO",
           "observedOn": observed_on, "sourceUrl": url, "payload": payload}
    # Exclude response-body hash (rotating cookies/scripts), but include extracted content and date.
    stable = {**row, "payload": {key: value for key, value in payload.items() if key != "sourceSha256"}}
    row["contentHash"] = hashlib.sha256(json.dumps(stable, sort_keys=True, ensure_ascii=True,
                                                 separators=(",", ":"), allow_nan=False).encode()).hexdigest()
    row["batchId"] = f"python-no-{observed_on}"
    return row
