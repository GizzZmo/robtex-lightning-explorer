#!/usr/bin/env node
import { Command } from 'commander';
import ora from 'ora';
import { createClient } from './client.js';
import { error, header, prettyObject, printJson, success } from './format.js';

const program = new Command();

program
  .name('robtex-ln')
  .description('Lightning Network & Bitcoin explorer powered by Robtex API')
  .version('1.0.0')
  .option('--json', 'Output raw JSON')
  .option('--api-key <key>', 'Robtex Pro API key')
  .option('--rapid-key <key>', 'RapidAPI key');

function getClient(opts: { apiKey?: string; rapidKey?: string }) {
  return createClient({
    apiKey: opts.apiKey ?? process.env.ROBTEX_API_KEY,
    rapidApiKey: opts.rapidKey ?? process.env.ROBTEX_RAPIDAPI_KEY,
  });
}

async function run<
  T,
>(
  label: string,
  fn: () => Promise<T>,
  opts: { json?: boolean },
) {
  const spinner = opts.json ? null : ora(label).start();
  try {
    const data = await fn();
    spinner?.succeed();
    if (opts.json) {
      printJson(data);
    } else {
      header(label);
      if (data && typeof data === 'object') {
        prettyObject(data as Record<string, unknown>);
      } else {
        console.log(data);
      }
      console.log();
    }
  } catch (e: any) {
    spinner?.fail();
    if (e?.status === 429) {
      error('Rate limited by Robtex free API. Set ROBTEX_API_KEY / ROBTEX_RAPIDAPI_KEY or wait.');
    } else {
      error(e?.message ?? String(e));
    }
    process.exitCode = 1;
  }
}

program
  .command('node <pubkey>')
  .description('Lookup a Lightning Network node by public key')
  .action(async (pubkey, _o, cmd) => {
    const opts = cmd.optsWithGlobals();
    const client = getClient(opts);
    await run(`Lightning node ${pubkey.slice(0, 16)}…`, () => client.lookupNode(pubkey), opts);
  });

program
  .command('channel <id>')
  .description('Lookup a Lightning channel (e.g. 936795x1154x0)')
  .action(async (id, _o, cmd) => {
    const opts = cmd.optsWithGlobals();
    const client = getClient(opts);
    await run(`Channel ${id}`, () => client.lookupChannel(id), opts);
  });

program
  .command('peers <pubkey>')
  .description('Recommended Lightning peers for a node')
  .option('-n, --limit <n>', 'Number of peers', '10')
  .action(async (pubkey, local, cmd) => {
    const opts = cmd.optsWithGlobals();
    const client = getClient(opts);
    await run(
      `Recommended peers for ${pubkey.slice(0, 16)}…`,
      () => client.recommendedPeers(pubkey, Number(local.limit)),
      opts,
    );
  });

program
  .command('recent')
  .description('Most recently opened Lightning channels')
  .option('-n, --count <n>', 'Number of channels', '10')
  .action(async (local, cmd) => {
    const opts = cmd.optsWithGlobals();
    const client = getClient(opts);
    await run(`Latest ${local.count} channels`, () => client.latestChannels(Number(local.count)), opts);
  });

program
  .command('search <alias>')
  .description('Search Lightning nodes by alias')
  .option('-n, --limit <n>', 'Max results', '20')
  .action(async (alias, local, cmd) => {
    const opts = cmd.optsWithGlobals();
    const client = getClient(opts);
    await run(`Search "${alias}"`, () => client.searchNodes(alias, Number(local.limit)), opts);
  });

program
  .command('channels <pubkey>')
  .description('List channels for a Lightning node')
  .option('-n, --limit <n>', 'Max channels', '50')
  .option('--offset <n>', 'Offset', '0')
  .action(async (pubkey, local, cmd) => {
    const opts = cmd.optsWithGlobals();
    const client = getClient(opts);
    await run(
      `Channels for ${pubkey.slice(0, 16)}…`,
      () => client.channelsForNode(pubkey, Number(local.limit), Number(local.offset)),
      opts,
    );
  });

program
  .command('address <address>')
  .description('Bitcoin address enrichment (balance, type, abuse flags)')
  .action(async (address, _o, cmd) => {
    const opts = cmd.optsWithGlobals();
    const client = getClient(opts);
    await run(`Address ${address}`, () => client.lookupAddress(address), opts);
  });

program
  .command('tx <txid>')
  .description('Bitcoin transaction details (+ LN correlation when available)')
  .action(async (txid, _o, cmd) => {
    const opts = cmd.optsWithGlobals();
    const client = getClient(opts);
    await run(`Transaction ${txid.slice(0, 16)}…`, () => client.lookupTransaction(txid), opts);
  });

program
  .command('address-txs <address>')
  .description('Transaction history for a Bitcoin address')
  .option('-n, --limit <n>', 'Max txs', '25')
  .option('--offset <n>', 'Offset', '0')
  .action(async (address, local, cmd) => {
    const opts = cmd.optsWithGlobals();
    const client = getClient(opts);
    await run(
      `Txs for ${address}`,
      () => client.addressTransactions(address, Number(local.limit), Number(local.offset)),
      opts,
    );
  });

program
  .command('ping')
  .description('Check Robtex API connectivity')
  .action(async (_o, cmd) => {
    const opts = cmd.optsWithGlobals();
    const client = getClient(opts);
    await run('API ping', () => client.ping(), opts);
  });

program.parseAsync(process.argv).catch((e) => {
  error(e?.message ?? String(e));
  process.exit(1);
});
