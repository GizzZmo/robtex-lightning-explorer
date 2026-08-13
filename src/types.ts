/**
 * Type definitions for Robtex Lightning Network & Bitcoin API responses.
 * Derived from live freeapi.robtex.com responses and OpenAPI docs.
 */

// ── Shared ─────────────────────────────────────────────────────────────

export type ApiStatus = 'ok' | 'error' | 'ratelimited' | string;

export interface ApiError {
  status: 'error' | 'ratelimited' | string;
  message?: string;
  ip?: string;
  upgrade?: string;
}

export interface Pagination {
  total?: number;
  returned?: number;
  limit?: number;
  offset?: number;
  hasMore?: boolean;
  estimated_total?: number;
}

// ── Lightning Network ──────────────────────────────────────────────────

/** Compact channel summary (used in latest channels list). */
export interface LightningChannelSummary {
  infoUrl?: string;
  scid_numeric?: string;
  scid_x?: string;
  scid_colon?: string;
  node1_pub?: string;
  node2_pub?: string;
  /** Present on some list endpoints */
  channelInt?: string;
  peer_pub?: string;
  capacity?: number;
}

/** Full channel details from lookup_lightning_channel. */
export interface LightningChannel {
  status: ApiStatus;
  node1_pub?: string;
  node2_pub?: string;
  channelId?: string;
  scid_numeric?: string;
  scid_x?: string;
  scid_colon?: string;
  /** Capacity in satoshis */
  capacity?: number;
  /** Funding transaction id */
  opentx?: string;
  openheight?: number;
  infoUrl?: string;
  [key: string]: unknown;
}

export interface LatestLightningChannelsResponse {
  status: ApiStatus;
  channels: LightningChannelSummary[];
}

/** Lightning node profile from lookup_lightning_node. */
export interface LightningNode {
  status: ApiStatus;
  pubkey?: string;
  alias?: string;
  peercount?: number;
  channelcount?: number;
  centralScoreRank?: number;
  color?: string;
  capacity?: number | string;
  addresses?: string[];
  uris?: string[];
  infoUrl?: string;
  [key: string]: unknown;
}

export interface LightningNodeSummary {
  pubkey: string;
  alias?: string;
  peercount?: number;
  channelcount?: number;
  centralScoreRank?: number;
  [key: string]: unknown;
}

export interface RecommendedPeer {
  pubkey: string;
  alias?: string;
  centralScoreRank?: number;
  motivation?: string;
  [key: string]: unknown;
}

export interface RecommendedPeersResponse {
  status: ApiStatus;
  source_node?: {
    pubkey?: string;
    alias?: string;
  };
  recommended_peers: RecommendedPeer[];
  pagination?: Pagination;
}

export interface SearchNodesResponse {
  status: ApiStatus;
  search_term?: string;
  nodes: LightningNodeSummary[];
  pagination?: Pagination;
}

export interface ChannelsPerNodeResponse {
  status: ApiStatus;
  channels: LightningChannelSummary[];
  pagination?: Pagination;
}

// ── Bitcoin ────────────────────────────────────────────────────────────

export type BitcoinAddressType =
  | 'p2pkh'
  | 'p2sh'
  | 'p2wpkh'
  | 'p2wsh'
  | 'p2tr'
  | string;

export interface BitcoinAddressInfo {
  address: string;
  type?: BitcoinAddressType;
  /** Values are often satoshi amounts as decimal strings */
  balance?: string;
  totalReceived?: string;
  totalSent?: string;
  txCount?: number;
  receivedTxCount?: number;
  sentTxCount?: number;
  receivedOutputCount?: number;
  spentInputCount?: number;
  maxBalance?: string;
  firstSeenBlock?: number | null;
  lastSeenBlock?: number | null;
  infoUrl?: string;
  [key: string]: unknown;
}

export interface BitcoinAbuseInfo {
  ransomware?: {
    family?: string;
    balanceUSD?: number;
  };
  ofacSanctioned?: boolean;
  [key: string]: unknown;
}

export interface BitcoinAddressResponse {
  status: ApiStatus;
  partial?: boolean;
  calculatedToBlock?: number | null;
  tipBlock?: number | null;
  genGap?: number | null;
  message?: string | null;
  address: BitcoinAddressInfo | null;
  abuse?: BitcoinAbuseInfo | null;
}

export interface BitcoinTxInput {
  address?: string | null;
  value?: string;
  prevTxid?: string | null;
  prevVout?: number | null;
  [key: string]: unknown;
}

export interface BitcoinTxOutput {
  index?: number;
  address?: string | null;
  value?: string;
  spent?: boolean;
  [key: string]: unknown;
}

export interface BitcoinTransaction {
  txid: string;
  blockHeight?: number | null;
  blockPosition?: number;
  mempool?: boolean;
  size?: number | null;
  weight?: number | null;
  locktime?: number | null;
  fee?: string | null;
  flags?: string[];
  inputCount?: number;
  outputCount?: number;
  inputs?: BitcoinTxInput[];
  outputs?: BitcoinTxOutput[];
  infoUrl?: string;
  /** Present when Robtex correlates the tx with Lightning channel opens */
  lightning?: unknown;
  [key: string]: unknown;
}

export interface BitcoinTransactionResponse {
  status: ApiStatus;
  transaction: BitcoinTransaction;
}

export interface BitcoinAddressTxSummary {
  txid: string;
  blockHeight?: number | null;
  blockPosition?: number;
  infoUrl?: string;
  [key: string]: unknown;
}

export interface BitcoinAddressTransactionsResponse {
  status: ApiStatus;
  address?: string;
  direction?: string;
  count?: number;
  transactions: BitcoinAddressTxSummary[];
}

export interface BitcoinSpendOutput {
  outputIndex?: number;
  value?: string;
  spent?: boolean;
  spendingTxid?: string | null;
  [key: string]: unknown;
}

export interface BitcoinTransactionSpendsResponse {
  status: ApiStatus;
  txid?: string;
  outputCount?: number;
  spentCount?: number;
  unspentCount?: number;
  outputs: BitcoinSpendOutput[];
}

export interface BitcoinBlock {
  height: number;
  hash?: string;
  timestamp?: number;
  version?: number | null;
  versionHex?: string | null;
  merkleRoot?: string | null;
  previousBlockHash?: string | null;
  nextBlockHash?: string | null;
  difficulty?: number;
  nonce?: number;
  size?: number;
  weight?: number;
  txCount?: number;
  txids?: string[];
  infoUrl?: string;
  [key: string]: unknown;
}

export interface BitcoinBlockResponse {
  status: ApiStatus;
  block: BitcoinBlock;
}

export interface BitcoinBlockchainStatsPoint {
  blockHeight: number;
  value: number;
}

export interface BitcoinBlockchainStatsResponse {
  status: ApiStatus;
  metric?: string;
  startBlock?: number;
  endBlock?: number;
  maxHeight?: number;
  dataPointCount?: number;
  dataPoints?: BitcoinBlockchainStatsPoint[];
}

// ── Utility ────────────────────────────────────────────────────────────

export interface PingResponse {
  status?: ApiStatus;
  backend?: {
    uptime?: number;
    version?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}
