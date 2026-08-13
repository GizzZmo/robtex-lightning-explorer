import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from './client.js';
import { RobtexValidationError } from './validate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const client = createClient();
const PORT = Number(process.env.PORT) || 3847;
const HOST = process.env.HOST || '0.0.0.0';

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

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
      const status = e?.status === 429 ? 429 : 500;
      res.status(status).json({
        error: e?.message ?? 'Internal error',
        status: e?.status,
      });
    });
  };
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'robtex-lightning-explorer', version: '1.1.0' });
});

app.get(
  '/api/node/:pubkey',
  asyncHandler(async (req, res) => {
    const data = await client.lookupNode(firstParam(req.params.pubkey));
    res.json(data);
  }),
);

app.get(
  '/api/channel/:id',
  asyncHandler(async (req, res) => {
    const data = await client.lookupChannel(firstParam(req.params.id));
    res.json(data);
  }),
);

app.get(
  '/api/peers/:pubkey',
  asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit) || 10;
    const data = await client.recommendedPeers(firstParam(req.params.pubkey), limit);
    res.json(data);
  }),
);

app.get(
  '/api/recent',
  asyncHandler(async (req, res) => {
    const count = Number(req.query.count) || 10;
    const data = await client.latestChannels(count);
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
    const data = await client.searchNodes(alias, limit);
    res.json(data);
  }),
);

app.get(
  '/api/channels/:pubkey',
  asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;
    const data = await client.channelsForNode(firstParam(req.params.pubkey), limit, offset);
    res.json(data);
  }),
);

app.get(
  '/api/address/:address',
  asyncHandler(async (req, res) => {
    const data = await client.lookupAddress(firstParam(req.params.address));
    res.json(data);
  }),
);

app.get(
  '/api/tx/:txid',
  asyncHandler(async (req, res) => {
    const data = await client.lookupTransaction(firstParam(req.params.txid));
    res.json(data);
  }),
);

app.get(
  '/api/address/:address/txs',
  asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit) || 25;
    const offset = Number(req.query.offset) || 0;
    const data = await client.addressTransactions(
      firstParam(req.params.address),
      limit,
      offset,
    );
    res.json(data);
  }),
);

app.listen(PORT, HOST, () => {
  console.log(`⚡ Robtex LN Explorer v1.1.0 at http://${HOST}:${PORT}`);
  console.log(`   health: http://${HOST}:${PORT}/health`);
});
