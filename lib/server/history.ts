import { rpcBatch } from "@/lib/rpc"
import { numberToHex } from "@/lib/format"

export const RANGES = { "1d": 86_400, "7d": 7 * 86_400, "30d": 30 * 86_400, "90d": 90 * 86_400 } as const
export type Range = keyof typeof RANGES

export interface HistoryPoint {
  block: number
  timestamp: number
  difficulty: string
  /** average seconds per block since the previous point */
  blockTime: number | null
}

interface Header {
  number: string
  timestamp: string
  difficulty: string
  miner: string
}

async function headers(numbers: number[]): Promise<Header[]> {
  const out: Header[] = []
  const chunks: number[][] = []
  for (let i = 0; i < numbers.length; i += 100) chunks.push(numbers.slice(i, i + 100))
  // a few batches in parallel keeps the request short without hammering the node
  for (let i = 0; i < chunks.length; i += 4) {
    const results = await Promise.all(
      chunks.slice(i, i + 4).map((chunk) =>
        rpcBatch<Header | null>(chunk.map((n) => ({ method: "eth_getBlockByNumber", params: [numberToHex(n), false] }))),
      ),
    )
    for (const list of results) for (const h of list) if (h) out.push(h)
  }
  return out
}

/** Estimates how many blocks cover `seconds` using the recent average block time. */
async function blocksFor(latest: number, seconds: number): Promise<number> {
  const probe = Math.min(2000, latest)
  const [a, b] = await headers([latest - probe, latest])
  const avg = (Number(BigInt(b.timestamp)) - Number(BigInt(a.timestamp))) / probe || 13
  return Math.min(latest, Math.ceil(seconds / avg))
}

export async function getHistory(range: Range, points = 120): Promise<HistoryPoint[]> {
  const [latestHex] = await rpcBatch<string>([{ method: "eth_blockNumber", params: [] }])
  const latest = Number(BigInt(latestHex))
  const span = await blocksFor(latest, RANGES[range])
  const step = Math.max(1, Math.floor(span / points))
  const numbers: number[] = []
  for (let n = latest - step * points; n <= latest; n += step) if (n >= 0) numbers.push(n)

  const list = await headers(numbers)
  return list.map((h, i) => {
    const prev = list[i - 1]
    const block = Number(BigInt(h.number))
    const timestamp = Number(BigInt(h.timestamp))
    return {
      block,
      timestamp,
      difficulty: BigInt(h.difficulty).toString(),
      blockTime: prev ? (timestamp - Number(BigInt(prev.timestamp))) / (block - Number(BigInt(prev.number))) : null,
    }
  })
}

export interface MinerShare {
  miner: string
  blocks: number
  share: number
}

/** Miner share over the last ~24 h, from every `sample`-th block (an estimate). */
export async function getMinerShares(sample = 6): Promise<{ miners: MinerShare[]; sampled: number; span: number; sample: number }> {
  const [latestHex] = await rpcBatch<string>([{ method: "eth_blockNumber", params: [] }])
  const latest = Number(BigInt(latestHex))
  const span = await blocksFor(latest, RANGES["1d"])
  const numbers: number[] = []
  for (let n = latest; n > latest - span; n -= sample) numbers.push(n)

  const list = await headers(numbers)
  const counts = new Map<string, number>()
  for (const h of list) counts.set(h.miner, (counts.get(h.miner) ?? 0) + 1)
  const miners = [...counts.entries()]
    .map(([miner, count]) => ({ miner, blocks: Math.round((count / list.length) * span), share: count / list.length }))
    .sort((a, b) => b.share - a.share)
  return { miners, sampled: list.length, span, sample }
}
