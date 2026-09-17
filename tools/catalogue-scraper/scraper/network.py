"""Bounded, identified HTTPS requests with robots enforcement."""

import ipaddress
import random
import socket
import time
from dataclasses import dataclass
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlsplit, urlunsplit
from urllib.request import HTTPRedirectHandler, ProxyHandler, Request, build_opener
from urllib.robotparser import RobotFileParser

AGENT = "NordicDriveCatalogBot"
MAX_BYTES = 8 * 1024 * 1024


class FetchError(Exception):
    """Public error codes deliberately exclude remote bodies and credentials."""


def canonical_url(value: str) -> str:
    parsed = urlsplit(value)
    if (parsed.scheme != "https" or not parsed.hostname or parsed.username
            or parsed.password or parsed.port not in (None, 443)):
        raise FetchError("unsafe_url")
    # Query-driven configurators need a dedicated adapter, not unbounded crawling.
    if parsed.query:
        raise FetchError("query_url_requires_adapter")
    return urlunsplit(("https", parsed.hostname.lower(), parsed.path or "/", "", ""))


@dataclass(frozen=True)
class Source:
    slug: str
    name: str
    allowed_hosts: tuple[str, ...]
    path_prefixes: tuple[str, ...]
    seeds: tuple[str, ...]
    enabled: bool = True

    def accepts(self, url: str, *, control: bool = False) -> str:
        url = canonical_url(url)
        parsed = urlsplit(url)
        if parsed.hostname not in self.allowed_hosts:
            raise FetchError("host_not_allowlisted")
        if not control and url not in self.seeds and not any(
            prefix == "/" or parsed.path == prefix.rstrip("/")
            or parsed.path.startswith(prefix.rstrip("/") + "/")
            for prefix in self.path_prefixes
        ):
            raise FetchError("outside_norwegian_paths")
        return url


class NoRedirects(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


@dataclass(frozen=True)
class Response:
    url: str
    body: bytes
    mime: str
    charset: str


class Client:
    def __init__(self, source: Source, contact: str, delay: float = 3):
        self.source = source
        identity = contact if contact.startswith("https://") else f"mailto:{contact}"
        self.user_agent = f"{AGENT}/1.0 (+{identity})"
        self.delay = max(3, delay)
        self.next_request = 0.0
        self.robots: dict[str, RobotFileParser] = {}
        self.stopped = False
        self.opener = build_opener(NoRedirects(), ProxyHandler({}))

    def _request(self, url: str) -> Response:
        # CLI input is trusted configuration, but never fetch private/reserved addresses.
        host = urlsplit(url).hostname
        try:
            addresses = socket.getaddrinfo(host, 443, type=socket.SOCK_STREAM)
        except OSError:
            raise FetchError("dns_failure") from None
        if not addresses or any(not ipaddress.ip_address(row[4][0]).is_global for row in addresses):
            raise FetchError("non_public_address")
        if self.stopped:
            raise FetchError("host_stopped")
        time.sleep(max(0, self.next_request - time.monotonic()))
        self.next_request = time.monotonic() + self.delay + random.uniform(0, 1)
        request = Request(url, headers={
            "User-Agent": self.user_agent,
            "Accept": "text/html,application/pdf,application/xml,text/plain;q=0.8",
            "Accept-Language": "nb-NO,nb;q=0.9,en;q=0.5",
            "Accept-Encoding": "identity",
        })
        try:
            with self.opener.open(request, timeout=25) as response:
                chunks = []
                size = 0
                deadline = time.monotonic() + 60
                while True:
                    chunk = response.read(65536)
                    size += len(chunk)
                    if size > MAX_BYTES or time.monotonic() > deadline:
                        raise FetchError("response_limit")
                    if not chunk:
                        break
                    chunks.append(chunk)
                return Response(url, b"".join(chunks), response.headers.get_content_type(),
                                response.headers.get_content_charset() or "utf-8")
        except HTTPError:
            raise
        except (URLError, OSError, TimeoutError):
            raise FetchError("network_failure") from None

    def policy(self, url: str) -> RobotFileParser:
        origin = "https://" + str(urlsplit(url).hostname)
        if origin in self.robots:
            return self.robots[origin]
        parser = RobotFileParser(origin + "/robots.txt")
        try:
            result = self._request(origin + "/robots.txt")
            if result.mime not in ("text/plain", "application/octet-stream"):
                raise FetchError("robots_unreadable")
            parser.parse(result.body.decode("utf-8", errors="replace").splitlines())
        except HTTPError as error:
            status = error.code
            error.close()
            if status in (404, 410):
                parser.parse(["User-agent: *", "Disallow:"])
            else:
                # Includes redirects, authentication, rate limiting and server errors.
                self.stopped = True
                raise FetchError(f"robots_unavailable_{status}") from None
        self.robots[origin] = parser
        rate = parser.request_rate(AGENT)
        self.delay = max(self.delay, parser.crawl_delay(AGENT) or 0,
                         rate.seconds / rate.requests if rate and rate.requests else 0)
        self.next_request = max(self.next_request, time.monotonic() + self.delay)
        return parser

    def get(self, url: str, *, control: bool = False) -> Response:
        for _ in range(5):
            url = self.source.accepts(url, control=control)
            if not self.policy(url).can_fetch(AGENT, url):
                raise FetchError("robots_denied")
            try:
                return self._request(url)
            except HTTPError as error:
                status, location = error.code, error.headers.get("Location")
                error.close()
                if status in (301, 302, 303, 307, 308) and location:
                    url = urljoin(url, location)
                    continue
                if status in (401, 403, 429, 503):
                    self.stopped = True
                raise FetchError(f"http_{status}") from None
        raise FetchError("redirect_limit")
