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
