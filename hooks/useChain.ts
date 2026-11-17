import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { getBlockRange, getLatestBlockNumber } from "@/services/chain"
import { network } from "@/config/network"
import { hexToNumber } from "@/lib/format"

export function useLatestBlockNumber() {
  return useQuery({
    queryKey: ["blockNumber"],
    queryFn: getLatestBlockNumber,
    refetchInterval: network.refetchInterval,
    select: hexToNumber,
  })
}

/** The last `count` blocks with their transactions, newest first. */
export function useRecentBlocks(count: number) {
  const { data: latest } = useLatestBlockNumber()

  return useQuery({
    queryKey: ["recentBlocks", count, latest],
    queryFn: () => getBlockRange(latest! - count + 1, latest!),
    enabled: latest !== undefined,
    placeholderData: keepPreviousData,
    staleTime: Infinity,
  })
}
