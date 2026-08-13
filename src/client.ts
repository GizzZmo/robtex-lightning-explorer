import { Robtex } from '@robtex/sdk';

export interface ClientOptions {
  apiKey?: string;
  rapidApiKey?: string;
}

/**
 * Focused client for Lightning Network + Bitcoin exploration via Robtex.
 */
export class LnExplorerClient {
  private api: Robtex;

  constructor(options: ClientOptions = {}) {
    const apiKey = options.apiKey ?? process.env.ROBTEX_API_KEY;
    const rapidApiKey = options.rapidApiKey ?? process.env.ROBTEX_RAPIDAPI_KEY;

    if (rapidApiKey) {
      this.api = new Robtex({ rapidApiKey });
    } else if (apiKey) {
      this.api = new Robtex({ apiKey });
    } else {
      this.api = new Robtex(); // free tier
    }
  }

  // ── Lightning Network ──────────────────────────────────────────────

  /** Lookup a Lightning node by public key (66 hex chars). */
  async lookupNode(pubkey: string) {
    return this.api.lookupLightningNode({ pubkey: normalizePubkey(pubkey) });
  }

  /** Lookup a channel by short channel ID (e.g. 936795x1154x0 or 936795:1154:0). */
  async lookupChannel(channelId: string) {
    return this.api.lookupLightningChannel({ channel_id: channelId });
  }

  /** Recommended peers for a node. */
  async recommendedPeers(pubkey: string, limit = 10) {
    return this.api.getRecommendedLightningPeers({
      pubkey: normalizePubkey(pubkey),
      limit,
    });
  }

  /** Most recently opened Lightning channels. */
  async latestChannels(count = 10) {
    return this.api.latestLightningChannels({ count });
  }

  /** Search nodes by alias (partial match). */
  async searchNodes(alias: string, limit = 20) {
    return this.api.searchLightningNodesByAlias({ alias, limit });
  }

  /** All (or paginated) channels for a node. */
  async channelsForNode(pubkey: string, limit = 100, offset = 0) {
    return this.api.lookupLightningChannelsPerNode({
      node: normalizePubkey(pubkey),
      limit,
      offset,
    });
  }

  // ── Bitcoin ────────────────────────────────────────────────────────

  /** Enrich a Bitcoin address (balance, type, first/last seen, abuse flags). */
  async lookupAddress(address: string) {
    return this.api.lookupBitcoinAddress({ address });
  }

  /** Full transaction details + possible LN channel correlation. */
  async lookupTransaction(txid: string) {
    return this.api.lookupBitcoinTransaction({ txid });
  }

  /** Paginated list of transactions involving an address. */
  async addressTransactions(address: string, limit = 25, offset = 0) {
    return this.api.bitcoinAddressTransactions({ address, limit, offset });
  }

  /** Which later transactions spent the outputs of a given tx. */
  async transactionSpends(txid: string) {
    return this.api.bitcoinTransactionSpends({ txid });
  }

  /** Block header + tx list by height. */
  async lookupBlock(height: number) {
    return this.api.lookupBitcoinBlock({ height });
  }

  /** Health / connectivity check. */
  async ping() {
    return this.api.ping();
  }
}

export function createClient(options?: ClientOptions) {
  return new LnExplorerClient(options);
}

function normalizePubkey(pubkey: string): string {
  return pubkey.replace(/^0x/i, '').toLowerCase();
}
