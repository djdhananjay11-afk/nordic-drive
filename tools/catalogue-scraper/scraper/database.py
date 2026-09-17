"""Insert-only staging integration with the existing Prisma-owned schema."""

import os
import uuid
from urllib.parse import parse_qsl, unquote, urlsplit


def connection_settings(url: str, target: str, environment: str) -> dict:
    if environment != "staging":
        raise ValueError("Only staging imports are enabled.")
    parsed = urlsplit(url)
    if parsed.scheme not in ("postgres", "postgresql") or not parsed.hostname:
        raise ValueError("Set SCRAPER_DATABASE_URL to a PostgreSQL staging URL.")
    database = unquote(parsed.path.lstrip("/"))
    user = unquote(parsed.username or "")
    identity = f"{user}@{parsed.hostname}:{parsed.port or 5432}/{database}"
    if not user or not database or target != identity:
        raise ValueError("--target must match user@host:port/database exactly (never include the password).")
    options = dict(parse_qsl(parsed.query))
    if options.get("schema", "public") != "public":
        raise ValueError("Only the existing public Prisma schema is supported.")
    local = parsed.hostname in ("localhost", "127.0.0.1", "::1")
    sslmode = options.get("sslmode", "verify-full" if not local else "disable")
    if not local and sslmode != "verify-full":
        raise ValueError("Remote databases require sslmode=verify-full and a trusted CA.")
    settings = dict(host=parsed.hostname, port=parsed.port or 5432, dbname=database, user=user,
                    password=unquote(parsed.password or ""), sslmode=sslmode, connect_timeout=10,
                    application_name="nordicdrive-catalogue-scraper",
                    options="-c statement_timeout=30000 -c lock_timeout=5000")
    if os.environ.get("PGSSLROOTCERT"):
        settings["sslrootcert"] = os.environ["PGSSLROOTCERT"]
    return settings


SQL = '''INSERT INTO public."CatalogEvidence"
    ("id", "contentHash", "recordKey", "batchId", "brandSlug", "modelName", "variantName",
     "market", "observedOn", "sourceUrl", "payload", "reviewStatus", "createdAt", "updatedAt")
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'PENDING', NOW(), NOW())
    ON CONFLICT ("contentHash") DO NOTHING'''


def insert_rows(rows: list[dict], settings: dict) -> int:
    import psycopg
    from psycopg.types.json import Jsonb

    count = 0
    # All rows commit together; connection/SQL errors roll back the complete import.
    with psycopg.connect(**settings) as connection:
        with connection.cursor() as cursor:
            for row in rows:
                cursor.execute(SQL, (str(uuid.uuid4()), row["contentHash"], row["recordKey"], row["batchId"],
                                    row["brandSlug"], None, None, "NO", row["observedOn"], row["sourceUrl"],
                                    Jsonb(row["payload"])))
                count += cursor.rowcount
    return count
