import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch, MagicMock
from urllib.error import HTTPError
from urllib.robotparser import RobotFileParser

from pypdf import PdfWriter

from scraper.cli import ROOT, crawl, load_sources, main, sitemap_links, validate_import_row
from scraper.database import connection_settings, insert_rows
from scraper.extract import evidence, parse_html, parse_pdf
from scraper.network import Client, FetchError, Response, Source, canonical_url

URL = "https://www.example.no/no/models/ev"
SOURCE = Source("example", "Example", ("www.example.no",), ("/no",), (URL,))
HTML = b'''<html><title>Electric model</title><h1>Example EV</h1>
<script type="application/ld+json">{"@type":"Car","name":"Example EV","fuelType":"Electric",
"additionalProperty":[{"name":"Battery gross","value":"82 kWh"}]}</script>
<table><tr><th>Specification</th><th>RWD</th><th>AWD</th></tr>
<tr><td>WLTP range</td><td>600 km</td><td>520 km</td></tr></table>
<dl><dt>DC charging</dt><dd>Up to 200 kW</dd></dl>
<p>Leasing price 5000 NOK / month.</p><p>Charging 20-80% in 30 minutes.</p>
<a href="/no/models/other">Other</a><meta property="og:image" content="https://cdn.example.no/car.jpg"></html>'''


class ExtractionTests(unittest.TestCase):
    def test_preserves_variant_columns_and_qualifiers(self):
        data, links = parse_html(HTML, URL)
        self.assertEqual(data["tables"][0]["rows"][0], ["Specification", "RWD", "AWD"])
        self.assertEqual(data["definitions"][0]["value"], "Up to 200 kW")
        self.assertIn("Leasing price 5000 NOK / month.", data["snippets"])
        self.assertIn("Charging 20-80% in 30 minutes.", data["snippets"])
        self.assertEqual(data["vehicles"][0]["fuelType"], "Electric")
        self.assertEqual(data["mediaCandidates"][0]["rightsStatus"], "UNVERIFIED")
        self.assertIn("https://www.example.no/no/models/other", links)

    def test_no_inference_from_generic_product(self):
        data, _ = parse_html(b'<script type="application/ld+json">{"@type":"Product","name":"Wheel"}</script>', URL)
        self.assertEqual(data["vehicles"], [])
        self.assertIn("NO_SPECIFICATIONS_FOUND_POSSIBLY_JAVASCRIPT_ONLY", data["warnings"])

    def test_malformed_json_ld_is_reported(self):
        data, _ = parse_html(b'<script type="application/ld+json">{bad}</script>', URL)
        self.assertIn("invalid_json_ld", data["warnings"])

    def test_captcha_not_catalogue_data(self):
        with self.assertRaises(ValueError):
            parse_html(b"<title>Verify you are human</title>", URL)

    def test_pdf_unknowns_not_fabricated(self):
        writer = PdfWriter()
        writer.add_blank_page(width=200, height=200)
        buffer = io.BytesIO()
        writer.write(buffer)
        result = parse_pdf(buffer.getvalue())
        self.assertEqual(result["pdfLines"], [])
        self.assertIn("PDF_SCAN_OCR_NOT_SUPPORTED", result["warnings"])

    def test_hash_ignores_scripts_but_tracks_facts(self):
        data, _ = parse_html(HTML, URL)
        first = evidence("example", URL, data, "2026-01-01", HTML)
        second = evidence("example", URL, data, "2026-01-01", HTML + b"<!-- nonce -->")
        self.assertEqual(first["contentHash"], second["contentHash"])
        third = evidence("example", URL, {**data, "title": "Changed"}, "2026-01-01", HTML)
        self.assertNotEqual(first["contentHash"], third["contentHash"])
        validate_import_row(first, {"example": SOURCE})
        first["market"] = "DE"
        with self.assertRaises(ValueError):
            validate_import_row(first, {"example": SOURCE})


class NetworkTests(unittest.TestCase):
    def test_url_restrictions(self):
        for url in ["http://www.example.no/", "https://user:pass@www.example.no/", "https://www.example.no:8443/", URL + "?sort=price"]:
            with self.subTest(url=url), self.assertRaises(FetchError):
                canonical_url(url)
        for url in ["https://www.example.no.evil.com/no/", "https://www.example.no/de/models", "https://www.example.no/norandom/"]:
            with self.subTest(url=url), self.assertRaises(FetchError):
                SOURCE.accepts(url)

    def test_private_dns_blocked_before_connect(self):
        client = Client(SOURCE, "operator@example.org")
        with patch("socket.getaddrinfo", return_value=[(2, 1, 6, "", ("127.0.0.1", 443))]):
            with self.assertRaisesRegex(FetchError, "non_public"):
                client._request(URL)

    def test_robots_and_delay(self):
        client = Client(SOURCE, "operator@example.org")
        response = Response(URL, b"User-agent: *\nDisallow: /no/private\nCrawl-delay: 9\nRequest-rate: 1/12", "text/plain", "utf-8")
        with patch.object(client, "_request", return_value=response):
            policy = client.policy(URL)
        self.assertEqual(client.delay, 12)
        self.assertFalse(policy.can_fetch("NordicDriveCatalogBot", "https://www.example.no/no/private"))

    def test_robots_denial_never_fetches_page(self):
        client = Client(SOURCE, "operator@example.org")
        parser = RobotFileParser()
        parser.parse(["User-agent: *", "Disallow: /"])
        with patch.object(client, "policy", return_value=parser), patch.object(client, "_request") as request:
            with self.assertRaisesRegex(FetchError, "robots_denied"):
                client.get(URL)
        request.assert_not_called()

    def test_robots_unavailable_fails_closed(self):
        client = Client(SOURCE, "operator@example.org")
        error = HTTPError(URL, 503, "Unavailable", {}, None)
        with patch.object(client, "_request", side_effect=error):
            with self.assertRaisesRegex(FetchError, "robots_unavailable"):
                client.policy(URL)

    def test_redirect_cannot_escape_allowlist(self):
        client = Client(SOURCE, "operator@example.org")
        policy = RobotFileParser()
        policy.parse(["User-agent: *", "Disallow:"])
        error = HTTPError(URL, 302, "Moved", {"Location": "https://evil.example/path"}, None)
        with patch.object(client, "policy", return_value=policy), patch.object(client, "_request", side_effect=error) as request:
            with self.assertRaisesRegex(FetchError, "host_not_allowlisted"):
                client.get(URL)
        self.assertEqual(request.call_count, 1)

    def test_rate_limit_stops_host(self):
        client = Client(SOURCE, "operator@example.org")
        policy = RobotFileParser()
        policy.parse(["User-agent: *", "Disallow:"])
        error = HTTPError(URL, 429, "Too many requests", {"Retry-After": "3600"}, None)
        with patch.object(client, "policy", return_value=policy), patch.object(client, "_request", side_effect=error):
            with self.assertRaisesRegex(FetchError, "http_429"):
                client.get(URL)
        self.assertTrue(client.stopped)

    def test_sitemaps_and_xml_entities(self):
        links, nested = sitemap_links(b'<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>https://www.example.no/models.xml</loc></sitemap></sitemapindex>')
        self.assertTrue(nested)
        self.assertEqual(len(links), 1)
        with self.assertRaises(ValueError):
            sitemap_links(b'<!DOCTYPE foo [<!ENTITY x "danger">]><foo/>')


class ImportTests(unittest.TestCase):
    def test_database_target_and_tls(self):
        url = "postgresql://user:secret@db.example.org:5432/catalogue?schema=public"
        settings = connection_settings(url, "user@db.example.org:5432/catalogue", "staging")
        self.assertEqual(settings["sslmode"], "verify-full")
        for target, environment in [("wrong", "staging"), ("user@db.example.org:5432/catalogue", "production")]:
            with self.assertRaises(ValueError):
                connection_settings(url, target, environment)
        with self.assertRaises(ValueError):
            connection_settings(url + "&sslmode=require", "user@db.example.org:5432/catalogue", "staging")

    def test_dry_run_never_connects(self):
        source = {"slug": "example", "name": "Example", "enabled": True,
                  "allowedHosts": ["www.example.no"], "pathPrefixes": ["/no"], "seedUrls": [URL]}
        data, _ = parse_html(HTML, URL)
        row = evidence("example", URL, data, "2026-01-01", HTML)
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root / "sources.json").write_text(json.dumps([source]))
            (root / "records").mkdir()
            (root / "records" / "test.json").write_text(json.dumps(row))
            with patch("scraper.cli.insert_rows") as insert:
                self.assertEqual(main(["--sources", str(root / "sources.json"), "import", "--input", temp]), 0)
            insert.assert_not_called()

    def test_sql_is_parameterized_insert_only(self):
        connection = MagicMock()
        cursor = connection.__enter__.return_value.cursor.return_value.__enter__.return_value
        cursor.rowcount = 1
        data, _ = parse_html(HTML, URL)
        row = evidence("example", URL, data, "2026-01-01", HTML)
        with patch("psycopg.connect", return_value=connection):
            self.assertEqual(insert_rows([row], {}), 1)
        sql, parameters = cursor.execute.call_args.args
        self.assertIn("ON CONFLICT", sql)
        self.assertNotIn("UPDATE", sql)
        self.assertNotIn("DELETE", sql)
        self.assertIn("'PENDING'", sql)
        self.assertEqual(parameters[4], "example")

    def test_source_registry_valid(self):
        sources = load_sources(ROOT / "sources.json")
        self.assertEqual(len(sources), 50)
        self.assertFalse(next(source for source in sources if source.slug == "gwm").enabled)

    def test_bounded_crawl_writes_evidence_and_stops_at_budget(self):
        from argparse import Namespace
        policy = RobotFileParser()
        policy.parse(["User-agent: *", "Disallow:"])
        with tempfile.TemporaryDirectory() as temp:
            args = Namespace(contact="operator@example.org", delay=3, max_pages=1, max_depth=3,
                             max_sitemaps=0, pdf=False, output=Path(temp))
            with patch("scraper.cli.Client") as client:
                client.return_value.stopped = False
                client.return_value.policy.return_value = policy
                client.return_value.get.return_value = Response(URL, HTML, "text/html", "utf-8")
                report = crawl(SOURCE, args)
            self.assertEqual(report["attempted"], 1)
            self.assertEqual(report["queuedRemaining"], 1)
            self.assertEqual(len(list((Path(temp) / "records").glob("*.json"))), 1)


if __name__ == "__main__":
    unittest.main()
