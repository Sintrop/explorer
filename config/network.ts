const refetch = Number(process.env.NEXT_PUBLIC_REFETCH_INTERVAL)

export const network = {
  explorerTitle: process.env.NEXT_PUBLIC_EXPLORER_TITLE ?? "Explorer",
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL ?? "",
  publicRpcUrl: process.env.NEXT_PUBLIC_NETWORK_RPC ?? process.env.NEXT_PUBLIC_RPC_URL ?? "",
  logoUrl: process.env.NEXT_PUBLIC_LOGO_HEADER_URL ?? "",
  coinName: process.env.NEXT_PUBLIC_COIN_NAME ?? "ETH",
  coinDecimals: 18,
  networkName: process.env.NEXT_PUBLIC_NETWORK_NAME ?? "",
  chainId: process.env.NEXT_PUBLIC_NETWORK_ID ?? "",
  seoTitle: process.env.NEXT_PUBLIC_SEO_TITLE ?? process.env.NEXT_PUBLIC_EXPLORER_TITLE ?? "Explorer",
  seoDescription: process.env.NEXT_PUBLIC_SEO_DESCRIPTION ?? "",
  isTestnet: process.env.NEXT_PUBLIC_TESTNET === "true",
  refetchInterval: Number.isFinite(refetch) && refetch > 0 ? refetch : 12000,
}
