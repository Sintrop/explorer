import net from "node:net"

/** A plain name, or one per locale: { "pt": "RPC público", "en": "Public RPC" } */
export type NodeName = string | Record<string, string>

export interface NodeConfig {
  name: NodeName
  rpc?: string
  host?: string
  p2pPort?: number
}

export interface NodeStatus {
  name: NodeName
  host: string | null
  p2pPort: number | null
  hasRpc: boolean
  rpcOnline: boolean | null
  p2pReachable: boolean | null
  client: string | null
  block: number | null
  peers: number | null
  syncing: boolean | null
  latencyMs: number | null
}

export function readNodeConfig(): NodeConfig[] {
  try {
    const parsed = JSON.parse(process.env.NETWORK_NODES ?? "[]")
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n?.name === "string" || (n?.name && typeof n.name === "object")) : []
  } catch {
    return []
  }
}

function hostOf(node: NodeConfig): string | null {
  if (node.host) return node.host
  try {
    return node.rpc ? new URL(node.rpc).hostname : null
  } catch {
    return null
  }
}

function checkTcp(host: string, port: number, timeoutMs = 3000): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port })
    const done = (ok: boolean) => {
      socket.destroy()
      resolve(ok)
    }
    socket.setTimeout(timeoutMs, () => done(false))
    socket.once("connect", () => done(true))
    socket.once("error", () => done(false))
  })
}

async function queryRpc(url: string) {
  const started = Date.now()
  const calls = ["web3_clientVersion", "eth_blockNumber", "net_peerCount", "eth_syncing"]
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(calls.map((method, id) => ({ jsonrpc: "2.0", id, method, params: [] }))),
    signal: AbortSignal.timeout(5000),
    cache: "no-store",
  })
  const body = (await response.json()) as { id: number; result?: unknown }[]
  const get = (i: number) => body.find((item) => item.id === i)?.result
  return {
    latencyMs: Date.now() - started,
    client: typeof get(0) === "string" ? (get(0) as string) : null,
    block: typeof get(1) === "string" ? Number(BigInt(get(1) as string)) : null,
    peers: typeof get(2) === "string" ? Number(BigInt(get(2) as string)) : null,
    syncing: get(3) === undefined ? null : get(3) !== false,
  }
}

export async function getNodeStatuses(): Promise<NodeStatus[]> {
  return Promise.all(
    readNodeConfig().map(async (node): Promise<NodeStatus> => {
      const host = hostOf(node)
      const [rpc, p2p] = await Promise.all([
        // one retry so a single slow response doesn't mark the node offline
        node.rpc ? queryRpc(node.rpc).catch(() => queryRpc(node.rpc!)).catch(() => null) : Promise.resolve(undefined),
        host && node.p2pPort ? checkTcp(host, node.p2pPort) : Promise.resolve(null),
      ])
      return {
        name: node.name,
        host: node.p2pPort ? host : null,
        p2pPort: node.p2pPort ?? null,
        hasRpc: !!node.rpc,
        rpcOnline: node.rpc ? !!rpc : null,
        p2pReachable: p2p,
        client: rpc?.client ?? null,
        block: rpc?.block ?? null,
        peers: rpc?.peers ?? null,
        syncing: rpc?.syncing ?? null,
        latencyMs: rpc?.latencyMs ?? null,
      }
    }),
  )
}
