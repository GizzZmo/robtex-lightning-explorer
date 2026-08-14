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
import { buildEgoGraph, type EgoGraph } from './ego.js';

export interface ClientOptions {
  apiKey?: string;
  rapidApiKey?: string;
  /** When false, skip Zod validation (not recommended). Default true. */
  validate?: boolean;
}

export interface EgoGraphOptions {
  /** Max channels to include (largest first). Default 80. */
  maxChannels?: number;
  /** Include recommended peers as dashed edges. Default true. */
  includeRecommended?: boolean;
  /** Max recommended peers. Default 8. */
  maxRecommended?: number;
  channelLimit?: number;
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

  async lookupNode(pubkey: string): Promise<LightningNode> {
    const raw = await this.api.lookupLightningNode({
      pubkey: normalizePubkey(pubkey),
    });
    return this.parse(LightningNodeSchema, raw, 'lookupNode');
  }

  async lookupChannel(channelId: string): Promise<LightningChannel> {
    const raw = await this.api.lookupLightningChannel({
      channel_id: channelId,
    });
    return this.parse(LightningChannelSchema, raw, 'lookupChannel');
  }

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

  async latestChannels(count = 10): Promise<LatestLightningChannelsResponse> {
    const raw = await this.api.latestLightningChannels({ count });
    return this.parse(LatestLightningChannelsResponseSchema, raw, 'latestChannels');
  }

  async searchNodes(alias: string, limit = 20): Promise<SearchNodesResponse> {
    const raw = await this.api.searchLightningNodesByAlias({ alias, limit });
    return this.parse(SearchNodesResponseSchema, raw, 'searchNodes');
  }

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

  /**
   * Build an ego-graph (center node + direct channel peers).
   * Optionally overlays recommended peers as non-channel edges.
   */
  async egoGraph(
    pubkey: string,
    options: EgoGraphOptions = {},
  ): Promise<EgoGraph> {
    const pk = normalizePubkey(pubkey);
    const channelLimit = options.channelLimit ?? options.maxChannels ?? 80;
    const includeRec = options.includeRecommended !== false;

    const [node, channelsRes, peersRes] = await Promise.all([
      this.lookupNode(pk),
      this.channelsForNode(pk, channelLimit, 0),
      includeRec
        ? this.recommendedPeers(pk, options.maxRecommended ?? 8).catch(
            () => null,
          )
        : Promise.resolve(null),
    ]);

    return buildEgoGraph({
      centerNode: node,
      channels: channelsRes.channels ?? [],
      recommended: peersRes?.recommended_peers,
      maxChannels: options.maxChannels ?? 80,
      maxRecommended: options.maxRecommended ?? 8,
    });
  }

  // ── Bitcoin ────────────────────────────────────────────────────────

  async lookupAddress(address: string): Promise<BitcoinAddressResponse> {
    const raw = await this.api.lookupBitcoinAddress({ address });
    return this.parse(BitcoinAddressResponseSchema, raw, 'lookupAddress');
  }

  async lookupTransaction(txid: string): Promise<BitcoinTransactionResponse> {
    const raw = await this.api.lookupBitcoinTransaction({ txid });
    return this.parse(BitcoinTransactionResponseSchema, raw, 'lookupTransaction');
  }

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

  async lookupBlock(height: number): Promise<BitcoinBlockResponse> {
    const raw = await this.api.lookupBitcoinBlock({ height });
    return this.parse(BitcoinBlockResponseSchema, raw, 'lookupBlock');
  }

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
export type { EgoGraph, EgoNode, EgoLink } from './ego.js';
export { buildEgoGraph } from './ego.js';
export { RobtexValidationError } from './validate.js';
