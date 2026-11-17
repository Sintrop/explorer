import { network } from "@/config/network"

export class RpcError extends Error {
  code?: number

  constructor(message: string, code?: number) {
    super(message)
    this.name = "RpcError"
    this.code = code
  }
}

let nextId = 1

export async function rpc<T>(method: string, params: unknown[] = []): Promise<T> {
  let response: Response

  try {
    response = await fetch(network.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method, params }),
    })
  } catch {
    throw new RpcError("network")
  }

  if (!response.ok) {
    throw new RpcError(`http ${response.status}`, response.status)
  }

  const body = await response.json()

  if (body.error) {
    throw new RpcError(body.error.message ?? "rpc", body.error.code)
  }

  return body.result as T
}

/** Sends several calls in one JSON-RPC batch. Results come back in the order of `calls`. */
export async function rpcBatch<T>(calls: { method: string; params: unknown[] }[]): Promise<T[]> {
  if (calls.length === 0) return []

  const firstId = nextId
  nextId += calls.length
  let response: Response

  try {
    response = await fetch(network.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(calls.map((c, i) => ({ jsonrpc: "2.0", id: firstId + i, method: c.method, params: c.params }))),
    })
  } catch {
    throw new RpcError("network")
  }

  if (!response.ok) throw new RpcError(`http ${response.status}`, response.status)

  const body = (await response.json()) as { id: number; result?: T; error?: { message: string; code: number } }[]
  if (!Array.isArray(body)) throw new RpcError("batch not supported")

  const byId = new Map(body.map((item) => [item.id, item]))
  return calls.map((_, i) => {
    const item = byId.get(firstId + i)
    if (!item) throw new RpcError("missing batch item")
    if (item.error) throw new RpcError(item.error.message, item.error.code)
    return item.result as T
  })
}
