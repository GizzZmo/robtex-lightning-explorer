# Robtex Lightning & Bitcoin Explorer

[![CI](https://github.com/GizzZmo/robtex-lightning-explorer/actions/workflows/ci.yml/badge.svg)](https://github.com/GizzZmo/robtex-lightning-explorer/actions/workflows/ci.yml)
[![Docker](https://github.com/GizzZmo/robtex-lightning-explorer/actions/workflows/docker.yml/badge.svg)](https://github.com/GizzZmo/robtex-lightning-explorer/actions/workflows/docker.yml)

**Lightning Network & Bitcoin explorer** powered by the [Robtex API](https://robtex.com).

Unique differentiator: combine classic Lightning node/channel intelligence with Bitcoin address & transaction enrichment from the same data source Robtex has maintained for decades.

**v1.3** — ego-graph (D3 force layout), response cache, CORS, spends/block endpoints.

## Features

| Feature | Description |
|---------|-------------|
| **Node lookup** | Full Lightning node details by public key |
| **Ego-graph** | Center node + channel peers (+ recommended) as D3 force graph |
| **Channel lookup** | Channel info by short channel ID |
| **Recommended peers** | Suggested peers for a given node |
| **Recent channels** | Latest opened Lightning channels |
| **Node search** | Search nodes by alias |
| **Channels per node** | List channels belonging to a node |
| **Bitcoin address** | Balance, type, first/last seen, abuse flags |
| **Bitcoin transaction** | Inputs, outputs, fee, LN channel correlation |
| **Tx spends** | Which later txs spent outputs of a given tx |
| **Address txs** | Paginated transaction history for an address |
| **Block lookup** | Bitcoin block by height |
| **Response cache** | In-memory TTL cache (default 60s) |
| **Zod validation** | Runtime schema checks; types inferred from schemas |

## Quick Start

```bash
git clone https://github.com/GizzZmo/robtex-lightning-explorer.git
cd robtex-lightning-explorer
npm install
npm run build

# CLI
npm start -- --help

# Web UI + API
npm run start:web
# → http://localhost:3847  (open Ego graph tab)
```

### Environment (optional)

```bash
export ROBTEX_API_KEY=your_pro_key
# or
export ROBTEX_RAPIDAPI_KEY=your_rapidapi_key
export PORT=3847
export HOST=0.0.0.0
export CACHE_TTL_MS=60000
export CORS_ORIGIN=*
```

## Deploy

### Docker

```bash
docker build -t robtex-ln .
docker run --rm -p 3847:3847 -e ROBTEX_API_KEY -e ROBTEX_RAPIDAPI_KEY robtex-ln
```

GHCR image (on push to `main`): `ghcr.io/gizzzmo/robtex-lightning-explorer`

### Render / Fly.io

See `render.yaml` and `fly.toml`. Health path: `/health`.

## CLI Usage

```bash
robtex-ln node <pubkey>
robtex-ln ego <pubkey> --max-channels 40
robtex-ln search ACINQ
robtex-ln peers <pubkey>
robtex-ln recent --count 20
robtex-ln channel 936795x1154x0
robtex-ln channels <pubkey>
robtex-ln address 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
robtex-ln tx <txid>
robtex-ln spends <txid>
robtex-ln address-txs <address>
robtex-ln block 840000
robtex-ln ping
```

## Library Usage

```ts
import { createClient, buildEgoGraph } from 'robtex-lightning-explorer';

const client = createClient();
const graph = await client.egoGraph(
  '03864ef025fde8fb587d989186ce6a4a186895ee44a926bfc370e2c366597a3f8f',
  { maxChannels: 60, includeRecommended: true },
);
// graph.nodes, graph.links, graph.stats — ready for D3 / Cytoscape / etc.
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/node/:pubkey` | Lightning node |
| GET | `/api/ego/:pubkey` | Ego-graph (nodes + links) |
| GET | `/api/channel/:id` | Channel |
| GET | `/api/peers/:pubkey` | Recommended peers |
| GET | `/api/recent?count=10` | Recent channels |
| GET | `/api/search?alias=` | Search by alias |
| GET | `/api/channels/:pubkey` | Channels of a node |
| GET | `/api/address/:address` | Bitcoin address |
| GET | `/api/tx/:txid` | Bitcoin transaction |
| GET | `/api/tx/:txid/spends` | Output spends of a tx |
| GET | `/api/address/:address/txs` | Address transactions |
| GET | `/api/block/:height` | Bitcoin block |
| GET | `/health` | Health (+ `?deep=1`) |

### Ego-graph query params

- `maxChannels` (default 80) — largest channels first
- `maxRecommended` (default 8)
- `includeRecommended` (`1`/`0`, default on)

## License

MIT

---

Built with [Robtex](https://robtex.com).
