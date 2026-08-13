/**
 * Type re-exports — types are inferred from Zod schemas in schemas.ts.
 * Prefer importing from the package root or from './schemas.js'.
 */
export type {
  ApiStatus,
  ApiError,
  Pagination,
  LightningChannelSummary,
  LightningChannel,
  LatestLightningChannelsResponse,
  LightningNode,
  LightningNodeSummary,
  RecommendedPeer,
  RecommendedPeersResponse,
  SearchNodesResponse,
  ChannelsPerNodeResponse,
  BitcoinAddressType,
  BitcoinAddressInfo,
  BitcoinAbuseInfo,
  BitcoinAddressResponse,
  BitcoinTxInput,
  BitcoinTxOutput,
  BitcoinTransaction,
  BitcoinTransactionResponse,
  BitcoinAddressTxSummary,
  BitcoinAddressTransactionsResponse,
  BitcoinSpendOutput,
  BitcoinTransactionSpendsResponse,
  BitcoinBlock,
  BitcoinBlockResponse,
  PingResponse,
} from './schemas.js';
