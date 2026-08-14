# Changelog

## [1.3.0] — 2026-08-14

### Added
- **Ego-graph** (`src/ego.ts`)
  - Local subgraph: center node + direct channel peers
  - Optional recommended peers as separate edge kind
  - Capacity-sorted channel selection for readable layouts
- Client: `egoGraph(pubkey, options)`
- API: `GET /api/ego/:pubkey?maxChannels=80&maxRecommended=8&includeRecommended=1`
- CLI: `robtex-ln ego <pubkey> [--max-channels N] [--max-recommended N] [--no-recommended]`
- Web UI: **Ego graph** tab with **D3 force-directed** layout
  - Pan / zoom, drag nodes, capacity-weighted edges
  - Center / peer / recommended styling + tooltips

## [1.2.0] — 2026-08-13

### Added
- In-memory TTL response cache (`src/cache.ts`)
- CORS support
- API/CLI: tx spends, block by height
- Health `?deep=1` pings Robtex
- UI tabs: channels, spends, address txs, block

## [1.1.0] — previous

- Zod validation, CI, Docker / Render / Fly
- Full LN + Bitcoin explorer surface
