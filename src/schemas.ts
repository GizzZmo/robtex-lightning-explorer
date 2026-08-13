/**
 * Zod schemas for Robtex Lightning Network & Bitcoin API responses.
 * Schema-first: TypeScript types are inferred via z.infer<>.
 * .passthrough() keeps unexpected fields Robtex may add over time.
 */
import { z } from 'zod';

// ── Shared ─────────────────────────────────────────────────────────────

export const PaginationSchema = z
  .object({
    total: z.number().optional(),
    returned: z.number().optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
    hasMore: z.boolean().optional(),
    estimated_total: z.number().optional(),
  })
  .passthrough();

export const ApiErrorSchema = z
  .object({
    status: z.string(),
    message: z.string().optional(),
    ip: z.string().optional(),
    upgrade: z.string().optional(),
  })
  .passthrough();

// ── Lightning Network ──────────────────────────────────────────────────

export const LightningChannelSummarySchema = z
  .object({
    infoUrl: z.string().optional(),
    scid_numeric: z.string().optional(),
    scid_x: z.string().optional(),
    scid_colon: z.string().optional(),
    node1_pub: z.string().optional(),
    node2_pub: z.string().optional(),
    channelInt: z.string().optional(),
    peer_pub: z.string().optional(),
    capacity: z.number().optional(),
  })
  .passthrough();

export const LightningChannelSchema = z
  .object({
    status: z.string(),
    node1_pub: z.string().optional(),
    node2_pub: z.string().optional(),
    channelId: z.string().optional(),
    scid_numeric: z.string().optional(),
    scid_x: z.string().optional(),
    scid_colon: z.string().optional(),
    capacity: z.number().optional(),
    opentx: z.string().optional(),
    openheight: z.number().optional(),
    infoUrl: z.string().optional(),
  })
  .passthrough();

export const LatestLightningChannelsResponseSchema = z
  .object({
    status: z.string(),
    channels: z.array(LightningChannelSummarySchema),
  })
  .passthrough();

export const LightningNodeSchema = z
  .object({
    status: z.string(),
    pubkey: z.string().optional(),
    alias: z.string().optional(),
    peercount: z.number().optional(),
    channelcount: z.number().optional(),
    centralScoreRank: z.number().optional(),
    color: z.string().optional(),
    capacity: z.union([z.number(), z.string()]).optional(),
    addresses: z.array(z.string()).optional(),
    uris: z.array(z.string()).optional(),
    infoUrl: z.string().optional(),
  })
  .passthrough();

export const LightningNodeSummarySchema = z
  .object({
    pubkey: z.string(),
    alias: z.string().optional(),
    peercount: z.number().optional(),
    channelcount: z.number().optional(),
    centralScoreRank: z.number().optional(),
  })
  .passthrough();

export const RecommendedPeerSchema = z
  .object({
    pubkey: z.string(),
    alias: z.string().optional(),
    centralScoreRank: z.number().optional(),
    motivation: z.string().optional(),
  })
  .passthrough();

export const RecommendedPeersResponseSchema = z
  .object({
    status: z.string(),
    source_node: z
      .object({
        pubkey: z.string().optional(),
        alias: z.string().optional(),
      })
      .passthrough()
      .optional(),
    recommended_peers: z.array(RecommendedPeerSchema),
    pagination: PaginationSchema.optional(),
  })
  .passthrough();

export const SearchNodesResponseSchema = z
  .object({
    status: z.string(),
    search_term: z.string().optional(),
    nodes: z.array(LightningNodeSummarySchema),
    pagination: PaginationSchema.optional(),
  })
  .passthrough();

export const ChannelsPerNodeResponseSchema = z
  .object({
    status: z.string(),
    channels: z.array(LightningChannelSummarySchema),
    pagination: PaginationSchema.optional(),
  })
  .passthrough();

// ── Bitcoin ────────────────────────────────────────────────────────────

export const BitcoinAddressInfoSchema = z
  .object({
    address: z.string(),
    type: z.string().optional(),
    balance: z.string().optional(),
    totalReceived: z.string().optional(),
    totalSent: z.string().optional(),
    txCount: z.number().optional(),
    receivedTxCount: z.number().optional(),
    sentTxCount: z.number().optional(),
    receivedOutputCount: z.number().optional(),
    spentInputCount: z.number().optional(),
    maxBalance: z.string().optional(),
    firstSeenBlock: z.number().nullable().optional(),
    lastSeenBlock: z.number().nullable().optional(),
    infoUrl: z.string().optional(),
  })
  .passthrough();

export const BitcoinAbuseInfoSchema = z
  .object({
    ransomware: z
      .object({
        family: z.string().optional(),
        balanceUSD: z.number().optional(),
      })
      .passthrough()
      .optional(),
    ofacSanctioned: z.boolean().optional(),
  })
  .passthrough();

export const BitcoinAddressResponseSchema = z
  .object({
    status: z.string(),
    partial: z.boolean().optional(),
    calculatedToBlock: z.number().nullable().optional(),
    tipBlock: z.number().nullable().optional(),
    genGap: z.number().nullable().optional(),
    message: z.string().nullable().optional(),
    address: BitcoinAddressInfoSchema.nullable(),
    abuse: BitcoinAbuseInfoSchema.nullable().optional(),
  })
  .passthrough();

export const BitcoinTxInputSchema = z
  .object({
    address: z.string().nullable().optional(),
    value: z.string().optional(),
    prevTxid: z.string().nullable().optional(),
    prevVout: z.number().nullable().optional(),
  })
  .passthrough();

export const BitcoinTxOutputSchema = z
  .object({
    index: z.number().optional(),
    address: z.string().nullable().optional(),
    value: z.string().optional(),
    spent: z.boolean().optional(),
  })
  .passthrough();

export const BitcoinTransactionSchema = z
  .object({
    txid: z.string(),
    blockHeight: z.number().nullable().optional(),
    blockPosition: z.number().optional(),
    mempool: z.boolean().optional(),
    size: z.number().nullable().optional(),
    weight: z.number().nullable().optional(),
    locktime: z.number().nullable().optional(),
    fee: z.string().nullable().optional(),
    flags: z.array(z.string()).optional(),
    inputCount: z.number().optional(),
    outputCount: z.number().optional(),
    inputs: z.array(BitcoinTxInputSchema).optional(),
    outputs: z.array(BitcoinTxOutputSchema).optional(),
    infoUrl: z.string().optional(),
    lightning: z.unknown().optional(),
  })
  .passthrough();

export const BitcoinTransactionResponseSchema = z
  .object({
    status: z.string(),
    transaction: BitcoinTransactionSchema,
  })
  .passthrough();

export const BitcoinAddressTxSummarySchema = z
  .object({
    txid: z.string(),
    blockHeight: z.number().nullable().optional(),
    blockPosition: z.number().optional(),
    infoUrl: z.string().optional(),
  })
  .passthrough();

export const BitcoinAddressTransactionsResponseSchema = z
  .object({
    status: z.string(),
    address: z.string().optional(),
    direction: z.string().optional(),
    count: z.number().optional(),
    transactions: z.array(BitcoinAddressTxSummarySchema),
  })
  .passthrough();

export const BitcoinSpendOutputSchema = z
  .object({
    outputIndex: z.number().optional(),
    value: z.string().optional(),
    spent: z.boolean().optional(),
    spendingTxid: z.string().nullable().optional(),
  })
  .passthrough();

export const BitcoinTransactionSpendsResponseSchema = z
  .object({
    status: z.string(),
    txid: z.string().optional(),
    outputCount: z.number().optional(),
    spentCount: z.number().optional(),
    unspentCount: z.number().optional(),
    outputs: z.array(BitcoinSpendOutputSchema),
  })
  .passthrough();

export const BitcoinBlockSchema = z
  .object({
    height: z.number(),
    hash: z.string().optional(),
    timestamp: z.number().optional(),
    version: z.number().nullable().optional(),
    versionHex: z.string().nullable().optional(),
    merkleRoot: z.string().nullable().optional(),
    previousBlockHash: z.string().nullable().optional(),
    nextBlockHash: z.string().nullable().optional(),
    difficulty: z.number().optional(),
    nonce: z.number().optional(),
    size: z.number().optional(),
    weight: z.number().optional(),
    txCount: z.number().optional(),
    txids: z.array(z.string()).optional(),
    infoUrl: z.string().optional(),
  })
  .passthrough();

export const BitcoinBlockResponseSchema = z
  .object({
    status: z.string(),
    block: BitcoinBlockSchema,
  })
  .passthrough();

export const PingResponseSchema = z
  .object({
    status: z.string().optional(),
    backend: z
      .object({
        uptime: z.number().optional(),
        version: z.string().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

// ── Inferred types (single source of truth) ────────────────────────────

export type Pagination = z.infer<typeof PaginationSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;

export type LightningChannelSummary = z.infer<typeof LightningChannelSummarySchema>;
export type LightningChannel = z.infer<typeof LightningChannelSchema>;
export type LatestLightningChannelsResponse = z.infer<
  typeof LatestLightningChannelsResponseSchema
>;
export type LightningNode = z.infer<typeof LightningNodeSchema>;
export type LightningNodeSummary = z.infer<typeof LightningNodeSummarySchema>;
export type RecommendedPeer = z.infer<typeof RecommendedPeerSchema>;
export type RecommendedPeersResponse = z.infer<typeof RecommendedPeersResponseSchema>;
export type SearchNodesResponse = z.infer<typeof SearchNodesResponseSchema>;
export type ChannelsPerNodeResponse = z.infer<typeof ChannelsPerNodeResponseSchema>;

export type BitcoinAddressInfo = z.infer<typeof BitcoinAddressInfoSchema>;
export type BitcoinAbuseInfo = z.infer<typeof BitcoinAbuseInfoSchema>;
export type BitcoinAddressResponse = z.infer<typeof BitcoinAddressResponseSchema>;
export type BitcoinTxInput = z.infer<typeof BitcoinTxInputSchema>;
export type BitcoinTxOutput = z.infer<typeof BitcoinTxOutputSchema>;
export type BitcoinTransaction = z.infer<typeof BitcoinTransactionSchema>;
export type BitcoinTransactionResponse = z.infer<typeof BitcoinTransactionResponseSchema>;
export type BitcoinAddressTxSummary = z.infer<typeof BitcoinAddressTxSummarySchema>;
export type BitcoinAddressTransactionsResponse = z.infer<
  typeof BitcoinAddressTransactionsResponseSchema
>;
export type BitcoinSpendOutput = z.infer<typeof BitcoinSpendOutputSchema>;
export type BitcoinTransactionSpendsResponse = z.infer<
  typeof BitcoinTransactionSpendsResponseSchema
>;
export type BitcoinBlock = z.infer<typeof BitcoinBlockSchema>;
export type BitcoinBlockResponse = z.infer<typeof BitcoinBlockResponseSchema>;
export type PingResponse = z.infer<typeof PingResponseSchema>;

/** @deprecated Prefer string; kept for compatibility */
export type ApiStatus = string;
export type BitcoinAddressType = string;
