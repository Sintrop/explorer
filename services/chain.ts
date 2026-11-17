import { rpc } from "@/lib/rpc"
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
