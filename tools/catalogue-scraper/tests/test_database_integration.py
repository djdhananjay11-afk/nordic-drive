"""Opt-in tests against a disposable CI database with the Prisma schema installed."""

import os
import unittest
import uuid
from urllib.parse import unquote, urlsplit

import psycopg

from scraper.database import connection_settings, insert_rows
from scraper.extract import evidence


@unittest.skipUnless(os.environ.get("SCRAPER_TEST_DATABASE_URL"), "No disposable PostgreSQL test database configured")
class DatabaseIntegrationTests(unittest.TestCase):
    def setUp(self):
        url = os.environ["SCRAPER_TEST_DATABASE_URL"]
        parsed = urlsplit(url)
        target = f"{unquote(parsed.username)}@{parsed.hostname}:{parsed.port or 5432}/{unquote(parsed.path.lstrip('/'))}"
        self.settings = connection_settings(url, target, "staging")
        self.brand = "scraper-test-" + uuid.uuid4().hex
        self.row = evidence(self.brand, "https://example.org/specs", {"tables": []}, "2026-01-01", b"test")

    def tearDown(self):
        # Delete only the unique fixture prefix created by this individual test.
        with psycopg.connect(**self.settings) as connection:
            connection.execute('DELETE FROM public."CatalogEvidence" WHERE "brandSlug" = %s', (self.brand,))

    def test_duplicate_does_not_reset_review(self):
        self.assertEqual(insert_rows([self.row], self.settings), 1)
        with psycopg.connect(**self.settings) as connection:
            connection.execute('UPDATE public."CatalogEvidence" SET "reviewStatus" = \'APPROVED\' WHERE "contentHash" = %s', (self.row["contentHash"],))
        self.assertEqual(insert_rows([self.row], self.settings), 0)
        with psycopg.connect(**self.settings) as connection:
            result = connection.execute('SELECT "reviewStatus" FROM public."CatalogEvidence" WHERE "contentHash" = %s', (self.row["contentHash"],)).fetchone()
        self.assertEqual(result[0], "APPROVED")

    def test_failed_batch_rolls_back(self):
        invalid = {**self.row, "contentHash": "f" * 64, "brandSlug": None}
        with self.assertRaises(psycopg.Error):
            insert_rows([self.row, invalid], self.settings)
        with psycopg.connect(**self.settings) as connection:
            result = connection.execute('SELECT count(*) FROM public."CatalogEvidence" WHERE "contentHash" = %s', (self.row["contentHash"],)).fetchone()
        self.assertEqual(result[0], 0)
