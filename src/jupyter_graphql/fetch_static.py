from urllib.request import urlretrieve
from urllib.parse import urlparse
import sys

from .constants import STATIC

# Download the file from `url` and save it locally under `file_name`:

JSDELIVR_ASSETS = [
    "https://cdn.jsdelivr.net/npm/graphiql@0.11.10/graphiql.css",
    "https://cdn.jsdelivr.net/npm/whatwg-fetch@2.0.3/fetch.min.js",
    "https://cdn.jsdelivr.net/npm/react@16.2.0/umd/react.production.min.js",
    "https://cdn.jsdelivr.net/npm/react-dom@16.2.0/umd/react-dom.production.min.js",
    "https://cdn.jsdelivr.net/npm/graphiql@0.11.10/graphiql.min.js",
    # "https://cdn.jsdelivr.net/npm/subscriptions-transport-ws@0.7.0/browser/client.js",
    # "https://cdn.jsdelivr.net/npm/graphiql-subscriptions-fetcher@0.0.2/dist/fetcher.js",
]

UNPKG_ASSETS = [
    "https://unpkg.com/subscriptions-transport-ws@0.7.0/browser/client.js",
    "https://unpkg.com/graphiql-subscriptions-fetcher@0.0.2/browser/client.js",
]


def fetch_assets(assets, prefix=None, force=False):
    for url in assets:
        out = STATIC
        if prefix:
            out = STATIC / prefix
        out = (out / urlparse(url).path[1:]).resolve()
        if force or not out.exists():
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text("")
            print(f"fetching\n\t- {url}\n\t> {out.relative_to(STATIC)}")
            urlretrieve(url, out)


def fetch_static(force=False):
    fetch_assets(JSDELIVR_ASSETS, force=force)
    fetch_assets(UNPKG_ASSETS, "npm", force=force)


if __name__ == "__main__":
    fetch_static(force="--force" in sys.argv)
