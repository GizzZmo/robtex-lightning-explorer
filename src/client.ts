import { Robtex } from '@robtex/sdk';
import type {
  BitcoinAddressResponse,
  BitcoinAddressTransactionsResponse,
  BitcoinBlockResponse,
  BitcoinTransactionResponse,
  BitcoinTransactionSpendsResponse,
  ChannelsPerNodeResponse,
  ClientOptions as _Unused,
  LatestLightningChannelsResponse,
  LightningChannel,
  LightningNode,
  PingResponse,
  RecommendedPeersResponse,
  SearchNodesResponse,
} from './types.js';

export interface ClientOptions {
  apiKey?: string;
  rapidApiKey?: string;
}

/**
 * Focused client for Lightning Network + Bitcoin exploration via Robtex.
 * All methods return typed responses based on live API shapes.
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
  async lookupNode(pubkey: string): Promise<LightningNode> {
    return this.api.lookupLightningNode({
      pubkey: normalizePubkey(pubkey),
    }) as Promise<LightningNode>;
  }

  /** Lookup a channel by short channel ID (e.g. 936795x1154x0 or 936795:1154:0). */
  async lookupChannel(channelId: string): Promise<LightningChannel> {
    return this.api.lookupLightningChannel({
      channel_id: channelId,
    }) as Promise<LightningChannel>;
  }

  /** Recommended peers for a node. */
  async recommendedPeers(
    pubkey: string,
    limit = 10,
  ): Promise<RecommendedPeersResponse> {
    return this.api.getRecommendedLightningPeers({
      pubkey: normalizePubkey(pubkey),
      limit,
    }) as Promise<RecommendedPeersResponse>;
  }

  /** Most recently opened Lightning channels. */
  async latestChannels(count = 10): Promise<LatestLightningChannelsResponse> {
    return this.api.latestLightningChannels({
      count,
    }) as Promise<LatestLightningChannelsResponse>;
  }

  /** Search nodes by alias (partial match). */
  async searchNodes(alias: string, limit = 20): Promise<SearchNodesResponse> {
    return this.api.searchLightningNodesByAlias({
      alias,
      limit,
    }) as Promise<SearchNodesResponse>;
  }

  /** All (or paginated) channels for a node. */
  async channelsForNode(
    pubkey: string,
    limit = 100,
    offset = 0,
  ): Promise<ChannelsPerNodeResponse> {
    return this.api.lookupLightningChannelsPerNode({
      node: normalizePubkey(pubkey),
      limit,
      offset,
    }) as Promise<ChannelsPerNodeResponse>;
  }

  // ── Bitcoin ────────────────────────────────────────────────────────

  /** Enrich a Bitcoin address (balance, type, first/last seen, abuse flags). */
  async lookupAddress(address: string): Promise<BitcoinAddressResponse> {
    return this.api.lookupBitcoinAddress({
      address,
    }) as Promise<BitcoinAddressResponse>;
  }

  /** Full transaction details + possible LN channel correlation. */
  async lookupTransaction(txid: string): Promise<BitcoinTransactionResponse> {
    return this.api.lookupBitcoinTransaction({
      txid,
    }) as Promise<BitcoinTransactionResponse>;
  }

  /** Paginated list of transactions involving an address. */
  async addressTransactions(
    address: string,
    limit = 25,
    offset = 0,
  ): Promise<BitcoinAddressTransactionsResponse> {
    return this.api.bitcoinAddressTransactions({
      address,
      limit,
      offset,
    }) as Promise<BitcoinAddressTransactionsResponse>;
  }

  /** Which later transactions spent the outputs of a given tx. */
  async transactionSpends(
    txid: string,
  ): Promise<BitcoinTransactionSpendsResponse> {
    return this.api.bitcoinTransactionSpends({
      txid,
    }) as Promise<BitcoinTransactionSpendsResponse>;
  }

  /** Block header + tx list by height. */
  async lookupBlock(height: number): Promise<BitcoinBlockResponse> {
    return this.api.lookupBitcoinBlock({
      height,
    }) as Promise<BitcoinBlockResponse>;
  }

  /** Health / connectivity check. */
  async ping(): Promise<PingResponse> {
    return this.api.ping() as Promise<PingResponse>;
  }
}

export function createClient(options?: ClientOptions): LnExplorerClient {
  return new LnExplorerClient(options);
}

function normalizePubkey(pubkey: string): string {
  return pubkey.replace(/^0x/i, '').toLowerCase();
}

// Re-export types for consumers
export type * from './types.js';
