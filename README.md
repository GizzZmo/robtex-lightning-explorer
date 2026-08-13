# Robtex Lightning & Bitcoin Explorer

**Lightning Network & Bitcoin explorer** powered by the [Robtex API](https://robtex.com).

Unique differentiator: combine classic Lightning node/channel intelligence with Bitcoin address & transaction enrichment from the same data source Robtex has maintained for decades.

**v1.1** — Zod runtime validation on every API response, schema-inferred types, improved package exports.

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
| **Zod validation** | Runtime schema checks; types inferred from schemas |

## Quick Start

```bash
git clone https://github.com/GizzZmo/robtex-lightning-explorer.git
cd robtex-lightning-explorer
npm install

# CLI (dev)
npx tsx src/cli.ts --help
npx tsx src/cli.ts recent --count 5
npx tsx src/cli.ts search ACINQ

# Build & link
npm run build
npm link
robtex-ln --help
```

### Environment (optional)

```bash
# Free tier works with no key (rate-limited ~10 req/hr)
export ROBTEX_API_KEY=your_pro_key
# or
export ROBTEX_RAPIDAPI_KEY=your_rapidapi_key
```

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
robtex-ln address-txs <address>
robtex-ln ping

# JSON + skip validation if needed
robtex-ln node <pubkey> --json
robtex-ln recent --no-validate
```

## Web UI + API Server

```bash
npm run server
# → http://localhost:3847
```

## Library Usage

```ts
import {
  createClient,
  RobtexValidationError,
  type LightningNode,
  LightningNodeSchema,
} from 'robtex-lightning-explorer';

const client = createClient();
// createClient({ apiKey: '...' })
// createClient({ rapidApiKey: '...' })
// createClient({ validate: false }) // skip Zod (not recommended)

try {
  const node: LightningNode = await client.lookupNode(
    '03864ef025fde8fb587d989186ce6a4a186895ee44a926bfc370e2c366597a3f8f',
  );
  console.log(node.alias, node.channelcount);
} catch (e) {
  if (e instanceof RobtexValidationError) {
    console.error(e.context, e.issues);
  }
  throw e;
}
```

Schemas are exported if you want to validate data yourself:

```ts
import { LightningNodeSchema, parseResponse } from 'robtex-lightning-explorer';

const node = parseResponse(LightningNodeSchema, rawJson, 'my-context');
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
  schemas.ts  # Zod schemas + z.infer types (source of truth)
  validate.ts # parseResponse + RobtexValidationError
  client.ts   # LnExplorerClient (validated Robtex calls)
  types.ts    # Re-exports for compatibility
  cli.ts      # Commander CLI
  format.ts   # Terminal pretty-print
  server.ts   # Express API + static UI
  index.ts    # Public package exports
public/
  index.html  # Explorer frontend
```

## License

MIT

---

Built with [Robtex](https://robtex.com) — network intelligence since the early internet era.
