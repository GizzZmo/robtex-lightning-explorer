import { Robtex } from '@robtex/sdk';
import {
  BitcoinAddressResponseSchema,
  BitcoinAddressTransactionsResponseSchema,
  BitcoinBlockResponseSchema,
  BitcoinTransactionResponseSchema,
  BitcoinTransactionSpendsResponseSchema,
  ChannelsPerNodeResponseSchema,
  LatestLightningChannelsResponseSchema,
  LightningChannelSchema,
  LightningNodeSchema,
  PingResponseSchema,
  RecommendedPeersResponseSchema,
  SearchNodesResponseSchema,
  type BitcoinAddressResponse,
  type BitcoinAddressTransactionsResponse,
  type BitcoinBlockResponse,
  type BitcoinTransactionResponse,
  type BitcoinTransactionSpendsResponse,
  type ChannelsPerNodeResponse,
  type LatestLightningChannelsResponse,
  type LightningChannel,
  type LightningNode,
  type PingResponse,
  type RecommendedPeersResponse,
  type SearchNodesResponse,
} from './schemas.js';
import { parseResponse } from './validate.js';

export interface ClientOptions {
  apiKey?: string;
  rapidApiKey?: string;
  /** When false, skip Zod validation (not recommended). Default true. */
  validate?: boolean;
}

/**
 * Focused client for Lightning Network + Bitcoin exploration via Robtex.
 * Responses are validated at runtime with Zod when `validate` is true (default).
 */
export class LnExplorerClient {
  private api: Robtex;
  private validateEnabled: boolean;

  constructor(options: ClientOptions = {}) {
    const apiKey = options.apiKey ?? process.env.ROBTEX_API_KEY;
    const rapidApiKey = options.rapidApiKey ?? process.env.ROBTEX_RAPIDAPI_KEY;
    this.validateEnabled = options.validate !== false;

    if (rapidApiKey) {
      this.api = new Robtex({ rapidApiKey });
    } else if (apiKey) {
      this.api = new Robtex({ apiKey });
    } else {
      this.api = new Robtex(); // free tier
    }
  }

  private parse<T>(
    schema: Parameters<typeof parseResponse>[0],
    data: unknown,
    context: string,
  ): T {
    if (!this.validateEnabled) return data as T;
    return parseResponse(schema as never, data, context) as T;
  }

  // ── Lightning Network ──────────────────────────────────────────────

  /** Lookup a Lightning node by public key (66 hex chars). */
  async lookupNode(pubkey: string): Promise<LightningNode> {
    const raw = await this.api.lookupLightningNode({
      pubkey: normalizePubkey(pubkey),
    });
    return this.parse(LightningNodeSchema, raw, 'lookupNode');
  }

  /** Lookup a channel by short channel ID (e.g. 936795x1154x0). */
  async lookupChannel(channelId: string): Promise<LightningChannel> {
    const raw = await this.api.lookupLightningChannel({
      channel_id: channelId,
    });
    return this.parse(LightningChannelSchema, raw, 'lookupChannel');
  }

  /** Recommended peers for a node. */
  async recommendedPeers(
    pubkey: string,
    limit = 10,
  ): Promise<RecommendedPeersResponse> {
    const raw = await this.api.getRecommendedLightningPeers({
      pubkey: normalizePubkey(pubkey),
      limit,
    });
    return this.parse(RecommendedPeersResponseSchema, raw, 'recommendedPeers');
  }

  /** Most recently opened Lightning channels. */
  async latestChannels(count = 10): Promise<LatestLightningChannelsResponse> {
    const raw = await this.api.latestLightningChannels({ count });
    return this.parse(LatestLightningChannelsResponseSchema, raw, 'latestChannels');
  }

  /** Search nodes by alias (partial match). */
  async searchNodes(alias: string, limit = 20): Promise<SearchNodesResponse> {
    const raw = await this.api.searchLightningNodesByAlias({ alias, limit });
    return this.parse(SearchNodesResponseSchema, raw, 'searchNodes');
  }

  /** All (or paginated) channels for a node. */
  async channelsForNode(
    pubkey: string,
    limit = 100,
    offset = 0,
  ): Promise<ChannelsPerNodeResponse> {
    const raw = await this.api.lookupLightningChannelsPerNode({
      node: normalizePubkey(pubkey),
      limit,
      offset,
    });
    return this.parse(ChannelsPerNodeResponseSchema, raw, 'channelsForNode');
  }

  // ── Bitcoin ────────────────────────────────────────────────────────

  /** Enrich a Bitcoin address (balance, type, first/last seen, abuse flags). */
  async lookupAddress(address: string): Promise<BitcoinAddressResponse> {
    const raw = await this.api.lookupBitcoinAddress({ address });
    return this.parse(BitcoinAddressResponseSchema, raw, 'lookupAddress');
  }

  /** Full transaction details + possible LN channel correlation. */
  async lookupTransaction(txid: string): Promise<BitcoinTransactionResponse> {
    const raw = await this.api.lookupBitcoinTransaction({ txid });
    return this.parse(BitcoinTransactionResponseSchema, raw, 'lookupTransaction');
  }

  /** Paginated list of transactions involving an address. */
  async addressTransactions(
    address: string,
    limit = 25,
    offset = 0,
  ): Promise<BitcoinAddressTransactionsResponse> {
    const raw = await this.api.bitcoinAddressTransactions({
      address,
      limit,
      offset,
    });
    return this.parse(
      BitcoinAddressTransactionsResponseSchema,
      raw,
      'addressTransactions',
    );
  }

  /** Which later transactions spent the outputs of a given tx. */
  async transactionSpends(
    txid: string,
  ): Promise<BitcoinTransactionSpendsResponse> {
    const raw = await this.api.bitcoinTransactionSpends({ txid });
    return this.parse(
      BitcoinTransactionSpendsResponseSchema,
      raw,
      'transactionSpends',
    );
  }

  /** Block header + tx list by height. */
  async lookupBlock(height: number): Promise<BitcoinBlockResponse> {
    const raw = await this.api.lookupBitcoinBlock({ height });
    return this.parse(BitcoinBlockResponseSchema, raw, 'lookupBlock');
  }

  /** Health / connectivity check. */
  async ping(): Promise<PingResponse> {
    const raw = await this.api.ping();
    return this.parse(PingResponseSchema, raw, 'ping');
  }
}

export function createClient(options?: ClientOptions): LnExplorerClient {
  return new LnExplorerClient(options);
}

function normalizePubkey(pubkey: string): string {
  return pubkey.replace(/^0x/i, '').toLowerCase();
}

export type * from './schemas.js';
export { RobtexValidationError } from './validate.js';
