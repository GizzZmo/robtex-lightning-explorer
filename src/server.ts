import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from './client.js';
import { responseCache } from './cache.js';
import { RobtexValidationError } from './validate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const client = createClient();
const PORT = Number(process.env.PORT) || 3847;
const HOST = process.env.HOST || '0.0.0.0';
const VERSION = '1.3.0';

app.use(express.json());

app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (_req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
});

app.use(express.static(path.join(__dirname, '..', 'public')));

function asyncHandler(
  fn: (req: express.Request, res: express.Response) => Promise<void>,
) {
  return (req: express.Request, res: express.Response) => {
    fn(req, res).catch((err: unknown) => {
      if (err instanceof RobtexValidationError) {
        res.status(502).json({
          error: 'Invalid upstream response shape',
          context: err.context,
          issues: err.issues.slice(0, 10),
        });
        return;
      }
      const e = err as { status?: number; message?: string };
      const status = e?.status === 429 ? 429 : e?.status === 404 ? 404 : 500;
      res.status(status).json({
        error: e?.message ?? 'Internal error',
        status: e?.status,
      });
    });
  };
}

async function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const hit = responseCache.get<T>(key);
  if (hit !== undefined) return hit;
  const data = await fn();
  responseCache.set(key, data);
  return data;
}

app.get('/health', asyncHandler(async (req, res) => {
  const deep = req.query.deep === '1' || req.query.deep === 'true';
  const base = {
    ok: true,
    service: 'robtex-lightning-explorer',
    version: VERSION,
    cache: responseCache.stats,
    uptime_s: Math.floor(process.uptime()),
  };
  if (!deep) {
    res.json(base);
    return;
  }
  try {
    const ping = await client.ping();
    res.json({ ...base, robtex: { reachable: true, ping } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(503).json({
      ...base,
      ok: false,
      robtex: { reachable: false, error: msg },
    });
  }
}));

app.get(
  '/api/node/:pubkey',
  asyncHandler(async (req, res) => {
    const key = `node:${req.params.pubkey}`;
    const data = await cached(key, () => client.lookupNode(req.params.pubkey));
    res.json(data);
  }),
);

app.get(
  '/api/channel/:id',
  asyncHandler(async (req, res) => {
    const key = `channel:${req.params.id}`;
    const data = await cached(key, () => client.lookupChannel(req.params.id));
    res.json(data);
  }),
);

app.get(
  '/api/peers/:pubkey',
  asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit) || 10;
    const key = `peers:${req.params.pubkey}:${limit}`;
    const data = await cached(key, () =>
      client.recommendedPeers(req.params.pubkey, limit),
    );
    res.json(data);
  }),
);

app.get(
  '/api/recent',
  asyncHandler(async (req, res) => {
    const count = Number(req.query.count) || 10;
    const key = `recent:${count}`;
    const data = await cached(key, () => client.latestChannels(count));
    res.json(data);
  }),
);

app.get(
  '/api/search',
  asyncHandler(async (req, res) => {
    const alias = String(req.query.alias ?? '');
    if (!alias) {
      res.status(400).json({ error: 'alias query param required' });
      return;
    }
    const limit = Number(req.query.limit) || 20;
    const key = `search:${alias}:${limit}`;
    const data = await cached(key, () => client.searchNodes(alias, limit));
    res.json(data);
  }),
);

app.get(
  '/api/channels/:pubkey',
  asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;
    const key = `channels:${req.params.pubkey}:${limit}:${offset}`;
    const data = await cached(key, () =>
      client.channelsForNode(req.params.pubkey, limit, offset),
    );
    res.json(data);
  }),
);

/** Ego-graph: center node + channel peers (+ optional recommended peers). */
app.get(
  '/api/ego/:pubkey',
  asyncHandler(async (req, res) => {
    const maxChannels = Number(req.query.maxChannels) || 80;
    const maxRecommended = Number(req.query.maxRecommended) || 8;
    const includeRecommended =
      req.query.includeRecommended !== '0' &&
      req.query.includeRecommended !== 'false';
    const key = `ego:${req.params.pubkey}:${maxChannels}:${maxRecommended}:${includeRecommended}`;
    const data = await cached(key, () =>
      client.egoGraph(req.params.pubkey, {
        maxChannels,
        maxRecommended,
        includeRecommended,
      }),
    );
    res.json(data);
  }),
);

app.get(
  '/api/address/:address',
  asyncHandler(async (req, res) => {
    const key = `address:${req.params.address}`;
    const data = await cached(key, () => client.lookupAddress(req.params.address));
    res.json(data);
  }),
);

app.get(
  '/api/tx/:txid',
  asyncHandler(async (req, res) => {
    const key = `tx:${req.params.txid}`;
    const data = await cached(key, () => client.lookupTransaction(req.params.txid));
    res.json(data);
  }),
);

app.get(
  '/api/tx/:txid/spends',
  asyncHandler(async (req, res) => {
    const key = `tx-spends:${req.params.txid}`;
    const data = await cached(key, () => client.transactionSpends(req.params.txid));
    res.json(data);
  }),
);

app.get(
  '/api/address/:address/txs',
  asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit) || 25;
    const offset = Number(req.query.offset) || 0;
    const key = `address-txs:${req.params.address}:${limit}:${offset}`;
    const data = await cached(key, () =>
      client.addressTransactions(req.params.address, limit, offset),
    );
    res.json(data);
  }),
);

app.get(
  '/api/block/:height',
  asyncHandler(async (req, res) => {
    const height = Number(req.params.height);
    if (!Number.isFinite(height) || height < 0) {
      res.status(400).json({ error: 'height must be a non-negative number' });
      return;
    }
    const key = `block:${height}`;
    const data = await cached(key, () => client.lookupBlock(height));
    res.json(data);
  }),
);

app.listen(PORT, HOST, () => {
  console.log(`⚡ Robtex LN Explorer v${VERSION} at http://${HOST}:${PORT}`);
  console.log(`   health: http://${HOST}:${PORT}/health`);
  console.log(`   cache TTL: ${responseCache.stats.ttlMs}ms`);
});
