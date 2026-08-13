/**
 * Ambient module types for @robtex/sdk (v0.3.x).
 * The package ships plain ESM + JSDoc only — no .d.ts on npm.
 * Return types are unknown; this project validates responses with Zod.
 */
declare module '@robtex/sdk' {
  export interface RobtexClientOptions {
    apiKey?: string;
    rapidApiKey?: string;
    /** Base URL override (advanced) */
    baseUrl?: string;
  }

  export class RobtexError extends Error {
    status?: number;
    retryAfter?: number | null;
    constructor(message: string, status?: number, retryAfter?: number | null);
  }

  export class Robtex {
    constructor(options?: RobtexClientOptions);

    // Lightning Network
    lookupLightningNode(params: { pubkey: string }): Promise<unknown>;
    lookupLightningChannel(params: { channel_id: string }): Promise<unknown>;
    lookupLightningChannelsPerNode(params: {
      node: string;
      limit?: number;
      offset?: number;
    }): Promise<unknown>;
    getRecommendedLightningPeers(params: {
      pubkey: string;
      limit?: number;
    }): Promise<unknown>;
    searchLightningNodesByAlias(params: {
      alias: string;
      limit?: number;
    }): Promise<unknown>;
    latestLightningChannels(params: { count?: number }): Promise<unknown>;

    // Bitcoin
    lookupBitcoinTransaction(params: { txid: string }): Promise<unknown>;
    lookupBitcoinAddress(params: { address: string }): Promise<unknown>;
    lookupBitcoinBlock(params: { height: number }): Promise<unknown>;
    bitcoinAddressTransactions(params: {
      address: string;
      limit?: number;
      offset?: number;
    }): Promise<unknown>;
    bitcoinTransactionSpends(params: { txid: string }): Promise<unknown>;

    // Utility
    ping(): Promise<unknown>;
  }
}
