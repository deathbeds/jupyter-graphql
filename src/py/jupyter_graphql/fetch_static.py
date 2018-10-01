from pathlib import Path
from urllib.request import urlretrieve
from urllib.parse import urlparse

from . import STATIC

...
# Download the file from `url` and save it locally under `file_name`:

# ASSETS = [
#     "https://unpkg.com/graphiql@0.11.2/graphiql.css",
#     "https://unpkg.com/react@15.6.1/dist/react.min.js",
#     "https://unpkg.com/react-dom@15.6.1/dist/react-dom.min.js",
#     "https://unpkg.com/graphiql@0.11.2/graphiql.min.js",
#     "https://cdn.jsdelivr.net/fetch/2.0.1/fetch.min.js",
#     "https://unpkg.com/subscriptions-transport-ws@0.8.2/browser/client.js",
#     "https://unpkg.com/graphiql-subscriptions-fetcher@0.0.2/browser/client.js",
# ]

ASSETS = [
    "https://cdn.jsdelivr.net/npm/graphiql@0.11.10/graphiql.css",
    "https://cdn.jsdelivr.net/npm/whatwg-fetch@2.0.3/fetch.min.js",
    "https://cdn.jsdelivr.net/npm/react@16.2.0/umd/react.production.min.js",
    "https://cdn.jsdelivr.net/npm/react-dom@16.2.0/umd/react-dom.production.min.js",
    "https://cdn.jsdelivr.net/npm/graphiql@0.11.10/graphiql.min.js",
]


def fetch_static():
    for url in ASSETS:
        out = (STATIC / urlparse(url).path[1:]).resolve()
        if not out.exists():
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text("")
            print("fetching", url, "to", out)
            urlretrieve(url, out)


if __name__ == "__main__":
    fetch_static()
