import { useQuery } from "@tanstack/react-query"
import { getBlockWithTxs } from "@/services/chain"
import { network } from "@/config/network"

export function useLatestBlock() {
  return useQuery({
    queryKey: ["block", "latest"],
    queryFn: () => getBlockWithTxs("latest"),
    refetchInterval: network.refetchInterval,
  })
}
