# Atlas — Personal Media Index UI

A clean personal interface for searching public metadata from a configured TorrentGalaxy-compatible source.

## Requirements

- Node.js 18+ (20+ recommended)
- Internet connection for source searches

## Run locally

```bash
npm install
npm start
```

Open:

```text
http://localhost:3000
```

## API

Health check:

```text
GET /api/health
```

Search:

```text
GET /api/search?q=avatar&page=1
```

Metadata:

```text
GET /api/details?url=<source-detail-url>
```

## Notes

The app intentionally returns public index metadata and does not expose magnet/direct-download functionality.

The source site's URL structure can change. If the source changes its HTML, update `sourceSearch()` in `server.js`.

For personal testing only. Respect the source site's terms and applicable copyright law.


## Poster + card update

The search parser now targets the current `.tgxtablerow` / `.tgxtablecell` structure and extracts:
- poster/image URLs from `src`, `data-src`, `data-lazy-src`, and `data-original`
- title and detail URL
- size
- seeders / leechers
- year and quality when present in the title
- category when present

The frontend now renders real poster cards with lazy loading and a graceful poster fallback.
