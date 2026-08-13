# Changelog

## [1.2.0] — 2026-08-13

### Added
- In-memory TTL response cache (`src/cache.ts`) — reduces free-tier rate limits
  - Env: `CACHE_TTL_MS` (default `60000`)
- CORS support (`CORS_ORIGIN`, default `*`)
- API: `GET /api/tx/:txid/spends` — output spend tracking
- API: `GET /api/block/:height` — Bitcoin block by height
- CLI: `robtex-ln spends <txid>`
- CLI: `robtex-ln block <height>`
- Health: `GET /health?deep=1` pings Robtex and reports reachability + cache stats
- UI tabs: **Channels** (per node) and **Address txs**

### Changed
- Version bumped to 1.2.0 across package, CLI, and server banner
- Health response includes `uptime_s` and `cache` stats

## [1.1.0] — previous

- Zod validation, CI, Docker / Render / Fly deploy configs
- Full LN + Bitcoin explorer surface via CLI, library, and web API
