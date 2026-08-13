# Robtex Lightning & Bitcoin Explorer

[![CI](https://github.com/GizzZmo/robtex-lightning-explorer/actions/workflows/ci.yml/badge.svg)](https://github.com/GizzZmo/robtex-lightning-explorer/actions/workflows/ci.yml)
[![Docker](https://github.com/GizzZmo/robtex-lightning-explorer/actions/workflows/docker.yml/badge.svg)](https://github.com/GizzZmo/robtex-lightning-explorer/actions/workflows/docker.yml)

**Lightning Network & Bitcoin explorer** powered by the [Robtex API](https://robtex.com).

Unique differentiator: combine classic Lightning node/channel intelligence with Bitcoin address & transaction enrichment from the same data source Robtex has maintained for decades.

**v1.2** — response cache, CORS, spends/block endpoints, deeper health checks, expanded UI.

## Features

| Feature | Description |
|---------|-------------|
| **Node lookup** | Full Lightning node details by public key |
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

# Web UI + API (production)
npm run start:web
# → http://localhost:3847
```

### Environment (optional)

```bash
export ROBTEX_API_KEY=your_pro_key
# or
export ROBTEX_RAPIDAPI_KEY=your_rapidapi_key
export PORT=3847
export HOST=0.0.0.0
export CACHE_TTL_MS=60000   # response cache TTL (ms)
export CORS_ORIGIN=*        # or a specific origin
```

## Deploy

### Docker (local)

```bash
docker build -t robtex-ln .
docker run --rm -p 3847:3847 \
  -e ROBTEX_API_KEY \
  -e ROBTEX_RAPIDAPI_KEY \
  -e CACHE_TTL_MS=60000 \
  robtex-ln
# → http://localhost:3847/health
```

### GitHub Container Registry

On every push to `main`, [`.github/workflows/docker.yml`](.github/workflows/docker.yml) builds and pushes:

`ghcr.io/gizzzmo/robtex-lightning-explorer`

```bash
docker pull ghcr.io/gizzzmo/robtex-lightning-explorer:main
```

> Packages may be private by default — set the package visibility to public in GitHub Packages if needed.

### Render

1. New → Blueprint → connect this repo (`render.yaml`)
2. Or New Web Service → Docker → this repo
3. Set `ROBTEX_API_KEY` or `ROBTEX_RAPIDAPI_KEY` (optional; free tier works with rate limits)
4. Health check path: `/health`

### Fly.io

```bash
fly launch --no-deploy   # uses fly.toml
fly secrets set ROBTEX_API_KEY=...
fly deploy
```

### Railway / others

Use the Dockerfile. Start command: `node dist/server.js`. Port from `$PORT`.

## CLI Usage

```bash
robtex-ln node <pubkey>
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
import { createClient, RobtexValidationError } from 'robtex-lightning-explorer';

const client = createClient();
const node = await client.lookupNode('03864ef025fde8fb587d989186ce6a4a186895ee44a926bfc370e2c366597a3f8f');
const spends = await client.transactionSpends('<txid>');
const block = await client.lookupBlock(840000);
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/node/:pubkey` | Lightning node |
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
| GET | `/health` | Health check (+ `?deep=1` pings Robtex) |

## License

MIT

---

Built with [Robtex](https://robtex.com).
