/**
 * Ego-graph builder for Lightning Network exploration.
 *
 * An ego-graph is the local subgraph centered on one node:
 *   center node + its direct channel peers (+ optional recommended peers as dashed edges).
 */

import type {
  LightningChannelSummary,
  LightningNode,
  RecommendedPeer,
} from './schemas.js';

export interface EgoNode {
  id: string;
  alias?: string;
  kind: 'center' | 'peer' | 'recommended';
  channelcount?: number;
  peercount?: number;
  capacity?: number;
  color?: string;
  centralScoreRank?: number;
  motivation?: string;
}

export interface EgoLink {
  source: string;
  target: string;
  capacity?: number;
  scid?: string;
  kind: 'channel' | 'recommended';
}

export interface EgoGraph {
  center: string;
  centerAlias?: string;
  nodes: EgoNode[];
  links: EgoLink[];
  stats: {
    peerCount: number;
    channelCount: number;
    totalCapacitySats: number;
    recommendedCount: number;
  };
}

function norm(pk: string): string {
  return pk.replace(/^0x/i, '').toLowerCase();
}

function peerOf(
  center: string,
  ch: LightningChannelSummary,
): string | undefined {
  const c = norm(center);
  if (ch.peer_pub) return norm(ch.peer_pub);
  if (ch.node1_pub && norm(ch.node1_pub) === c && ch.node2_pub) {
    return norm(ch.node2_pub);
  }
  if (ch.node2_pub && norm(ch.node2_pub) === c && ch.node1_pub) {
    return norm(ch.node1_pub);
  }
  // Fallback: whichever endpoint is not the center
  if (ch.node1_pub && norm(ch.node1_pub) !== c) return norm(ch.node1_pub);
  if (ch.node2_pub && norm(ch.node2_pub) !== c) return norm(ch.node2_pub);
  return undefined;
}

export interface BuildEgoOptions {
  centerNode: LightningNode;
  channels: LightningChannelSummary[];
  recommended?: RecommendedPeer[];
  /** Max channel edges to include (largest capacity first). Default 80. */
  maxChannels?: number;
  /** Max recommended peers to overlay. Default 8. */
  maxRecommended?: number;
}

/**
 * Build a D3-friendly ego-graph from Robtex node + channels (+ optional peers).
 */
export function buildEgoGraph(opts: BuildEgoOptions): EgoGraph {
  const center = norm(opts.centerNode.pubkey || '');
  const maxCh = opts.maxChannels ?? 80;
  const maxRec = opts.maxRecommended ?? 8;

  const nodeMap = new Map<string, EgoNode>();

  nodeMap.set(center, {
    id: center,
    alias: opts.centerNode.alias,
    kind: 'center',
    channelcount: opts.centerNode.channelcount,
    peercount: opts.centerNode.peercount,
    capacity:
      typeof opts.centerNode.capacity === 'number'
        ? opts.centerNode.capacity
        : Number(opts.centerNode.capacity) || undefined,
    color: opts.centerNode.color,
    centralScoreRank: opts.centerNode.centralScoreRank,
  });

  // Prefer largest channels for a readable layout
  const sorted = [...opts.channels].sort(
    (a, b) => (b.capacity ?? 0) - (a.capacity ?? 0),
  );
  const selected = sorted.slice(0, maxCh);

  const links: EgoLink[] = [];
  let totalCapacity = 0;

  for (const ch of selected) {
    const peer = peerOf(center, ch);
    if (!peer || peer === center) continue;

    if (!nodeMap.has(peer)) {
      nodeMap.set(peer, {
        id: peer,
        kind: 'peer',
        capacity: ch.capacity,
      });
    } else {
      const n = nodeMap.get(peer)!;
      n.capacity = (n.capacity ?? 0) + (ch.capacity ?? 0);
    }

    const scid = ch.scid_x || ch.scid_colon || ch.scid_numeric || ch.channelInt;
    links.push({
      source: center,
      target: peer,
      capacity: ch.capacity,
      scid,
      kind: 'channel',
    });
    totalCapacity += ch.capacity ?? 0;
  }

  let recommendedCount = 0;
  if (opts.recommended?.length) {
    for (const rp of opts.recommended.slice(0, maxRec)) {
      const id = norm(rp.pubkey);
      if (id === center) continue;
      if (!nodeMap.has(id)) {
        nodeMap.set(id, {
          id,
          alias: rp.alias,
          kind: 'recommended',
          centralScoreRank: rp.centralScoreRank,
          motivation: rp.motivation,
        });
        links.push({
          source: center,
          target: id,
          kind: 'recommended',
        });
        recommendedCount += 1;
      } else if (nodeMap.get(id)!.kind === 'peer') {
        // Already a real channel peer — keep as peer, attach motivation if useful
        const n = nodeMap.get(id)!;
        n.motivation = rp.motivation ?? n.motivation;
        n.alias = n.alias || rp.alias;
      }
    }
  }

  const nodes = [...nodeMap.values()];
  const peerCount = nodes.filter((n) => n.kind === 'peer').length;

  return {
    center,
    centerAlias: opts.centerNode.alias,
    nodes,
    links,
    stats: {
      peerCount,
      channelCount: links.filter((l) => l.kind === 'channel').length,
      totalCapacitySats: totalCapacity,
      recommendedCount,
    },
  };
}
