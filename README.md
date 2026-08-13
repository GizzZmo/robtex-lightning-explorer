# Robtex Lightning & Bitcoin Explorer

**Lightning Network & Bitcoin explorer** powered by the [Robtex API](https://robtex.com).

Unique differentiator: combine classic Lightning node/channel intelligence with Bitcoin address & transaction enrichment from the same data source Robtex has maintained for decades.

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
| **Address txs** | Paginated transaction history for an address |

## Quick Start

```bash
# Clone
git clone https://github.com/GizzZmo/robtex-lightning-explorer.git
cd robtex-lightning-explorer

# Install
npm install

# Run CLI (dev)
npx tsx src/cli.ts --help

# Or build & install globally
npm run build
npm link
robtex-ln --help
```

### Environment (optional)

```bash
# Free tier works with no key (rate-limited ~10 req/hr)
# For higher limits:
export ROBTEX_API_KEY=your_pro_key
# or
export ROBTEX_RAPIDAPI_KEY=your_rapidapi_key
```

## CLI Usage

```bash
# Lookup a Lightning node
robtex-ln node 03864ef025fde8fb587d989186ce6a4a186895ee44a926bfc370e2c366597a3f8f

# Search nodes by alias
robtex-ln search ACINQ

# Recommended peers for a node
robtex-ln peers 03864ef025fde8fb587d989186ce6a4a186895ee44a926bfc370e2c366597a3f8f

# Latest opened channels
robtex-ln recent --count 20

# Lookup a channel
robtex-ln channel 936795x1154x0

# Channels belonging to a node
robtex-ln channels 03864ef025fde8fb587d989186ce6a4a186895ee44a926bfc370e2c366597a3f8f

# Bitcoin address enrichment
robtex-ln address 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa

# Bitcoin transaction
robtex-ln tx 0e3e2357e806b6cdb1f70b54c3a3a17b6714ee1f0e68bebb44a74b1efd512098

# JSON output (for piping)
robtex-ln node <pubkey> --json
```

## Web UI + API Server

```bash
npm run server
# → http://localhost:3847
```

Open the browser for a simple explorer UI. The Express server proxies Robtex so you avoid CORS and can keep API keys server-side.

## Library Usage

```ts
import { createClient } from 'robtex-lightning-explorer';

const client = createClient();
// or: createClient({ apiKey: '...' }) / { rapidApiKey: '...' }

const node = await client.lookupNode('03864ef025fde8fb587d989186ce6a4a186895ee44a926bfc370e2c366597a3f8f');
const peers = await client.recommendedPeers(node.pubkey);
const recent = await client.latestChannels(15);
const addr = await client.lookupAddress('bc1q...');
const tx = await client.lookupTransaction('txid...');
```

## API Endpoints (local server)

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
| GET | `/api/address/:address/txs` | Address transactions |
| GET | `/health` | Health check |

## Rate Limits

- **Free** (`freeapi.robtex.com`): ~10 requests/hour per IP
- **RapidAPI**: Free tier 500/mo, paid plans from $19/mo
- **Pro key**: Higher limits via Robtex dashboard
- **x402**: Pay-per-query with USDC on Base (no keys)

See [Robtex API docs](https://robtex.com/en/api) and [SDK](https://github.com/robtex/sdk).

## Project Structure

```
src/
  client.ts   # Thin wrapper around @robtex/sdk focused on LN + BTC
  cli.ts      # Commander-based CLI
  format.ts   # Pretty terminal output
  server.ts   # Express API + static UI
  index.ts    # Library entry
public/
  index.html  # Simple explorer frontend
```

## License

MIT

---

Built with [Robtex](https://robtex.com) — network intelligence since the early internet era.
