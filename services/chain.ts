import { rpc, rpcBatch } from "@/lib/rpc"
import { numberToHex } from "@/lib/format"
import { BlockProps } from "@/types/block"
import { CallTraceProps, ReceiptTxProps, TxProps } from "@/types/tx"

export type BlockId = number | bigint | string

function blockParams(id: BlockId): [string, string] {
  if (typeof id === "string" && /^0x[0-9a-f]{64}$/i.test(id)) {
    return ["eth_getBlockByHash", id]
  }
  const tag = typeof id === "string" && !/^\d+$/.test(id) ? id : numberToHex(BigInt(id))
  return ["eth_getBlockByNumber", tag]
}

export function getBlock(id: BlockId): Promise<BlockProps<string> | null> {
  const [method, param] = blockParams(id)
  return rpc(method, [param, false])
}

export function getBlockWithTxs(id: BlockId): Promise<BlockProps<TxProps> | null> {
  const [method, param] = blockParams(id)
  return rpc(method, [param, true])
}

export const getLatestBlockNumber = () => rpc<string>("eth_blockNumber")
export const getTransaction = (hash: string) => rpc<TxProps | null>("eth_getTransactionByHash", [hash])
export const getReceipt = (hash: string) => rpc<ReceiptTxProps | null>("eth_getTransactionReceipt", [hash])
export const getBalance = (address: string) => rpc<string>("eth_getBalance", [address, "latest"])
export const getTransactionCount = (address: string) => rpc<string>("eth_getTransactionCount", [address, "latest"])
export const getCode = (address: string) => rpc<string>("eth_getCode", [address, "latest"])
export const traceTransaction = (hash: string) =>
  rpc<CallTraceProps>("debug_traceTransaction", [hash, { tracer: "callTracer" }])

export const getGasPrice = () => rpc<string>("eth_gasPrice")
export const getTxPoolStatus = () => rpc<{ pending: string; queued: string }>("txpool_status")

const blockCache = new Map<number, BlockProps<TxProps>>()
const BLOCK_CACHE_LIMIT = 2000
// the newest blocks can still be replaced by a reorg, so they are always refetched
const REORG_DEPTH = 3

/** Fetches a contiguous range of full blocks (newest first), reusing blocks already loaded. */
export async function getBlockRange(from: number, to: number): Promise<BlockProps<TxProps>[]> {
  const numbers: number[] = []
  for (let n = to; n >= Math.max(0, from); n--) numbers.push(n)

  const missing = numbers.filter((n) => n > to - REORG_DEPTH || !blockCache.has(n))

  for (let i = 0; i < missing.length; i += 100) {
    const chunk = missing.slice(i, i + 100)
    const blocks = await rpcBatch<BlockProps<TxProps> | null>(
      chunk.map((n) => ({ method: "eth_getBlockByNumber", params: [numberToHex(n), true] })),
    )
    blocks.forEach((block, j) => block && blockCache.set(chunk[j], block))
  }

  if (blockCache.size > BLOCK_CACHE_LIMIT) {
    const oldest = [...blockCache.keys()].sort((a, b) => a - b).slice(0, blockCache.size - BLOCK_CACHE_LIMIT)
    oldest.forEach((n) => blockCache.delete(n))
  }

  return numbers.map((n) => blockCache.get(n)).filter((b): b is BlockProps<TxProps> => !!b)
}

export interface LogEntry {
  address: string
  topics: string[]
  data: string
  blockNumber: string
  transactionHash: string
  logIndex: string
}

export function getLogs(filter: { address?: string | string[]; topics?: (string | null)[]; fromBlock?: number; toBlock?: number }) {
  return rpc<LogEntry[]>("eth_getLogs", [
    {
      address: filter.address,
      topics: filter.topics,
      fromBlock: numberToHex(filter.fromBlock ?? 0),
      toBlock: filter.toBlock !== undefined ? numberToHex(filter.toBlock) : "latest",
    },
  ])
}

export const ethCall = (to: string, data: string) => rpc<string>("eth_call", [{ to, data }, "latest"])

const timestampCache = new Map<number, number>()

/** Block timestamps (seconds) for a list of block numbers, fetched in one batch. */
export async function getBlockTimestamps(numbers: number[]): Promise<Map<number, number>> {
  const missing = [...new Set(numbers)].filter((n) => !timestampCache.has(n))
  for (let i = 0; i < missing.length; i += 100) {
    const chunk = missing.slice(i, i + 100)
    const blocks = await rpcBatch<{ timestamp: string } | null>(
      chunk.map((n) => ({ method: "eth_getBlockByNumber", params: [numberToHex(n), false] })),
    )
    blocks.forEach((block, j) => block && timestampCache.set(chunk[j], Number(BigInt(block.timestamp))))
  }
  return new Map(numbers.map((n) => [n, timestampCache.get(n) ?? 0]))
}
