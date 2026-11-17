"use client"

import { JSX, ReactNode } from "react"
import { useQuery } from "@tanstack/react-query"
import { useFormatter, useLocale, useTranslations } from "next-intl"
import { Blocks, Clock, Cpu, Fuel, Hourglass, Mountain } from "lucide-react"
import { useLatestBlockNumber, useRecentBlocks } from "@/hooks/useChain"
import { getGasPrice, getTxPoolStatus } from "@/services/chain"
import { formatUnitsLocale, hexToBigInt, hexToNumber } from "@/lib/format"
import { formatHashrate } from "@/lib/stats"
import { network } from "@/config/network"
import { Skeleton } from "@/components/ui/Skeleton"
import { RECENT_WINDOW } from "./recent"

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value?: ReactNode }): JSX.Element {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">{icon}</div>
      <div className="min-w-0">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-lg font-semibold tabular-nums">{value ?? <Skeleton className="h-5 w-20" />}</p>
      </div>
    </div>
  )
}

export function NetworkStats(): JSX.Element {
  const t = useTranslations("home")
  const format = useFormatter()
  const locale = useLocale()
  const { data: latest } = useLatestBlockNumber()
  const { data: blocks } = useRecentBlocks(RECENT_WINDOW)
  const { data: gasPrice } = useQuery({ queryKey: ["gasPrice"], queryFn: getGasPrice, refetchInterval: 60000 })
  const pool = useQuery({ queryKey: ["txpool"], queryFn: getTxPoolStatus, refetchInterval: network.refetchInterval, retry: false })

  let avgBlockTime: number | undefined
  let hashrate: number | undefined
  if (blocks && blocks.length > 1) {
    const newest = hexToNumber(blocks[0].timestamp)
    const oldest = hexToNumber(blocks[blocks.length - 1].timestamp)
    avgBlockTime = (newest - oldest) / (blocks.length - 1)
    hashrate = avgBlockTime > 0 ? hexToNumber(blocks[0].difficulty) / avgBlockTime : undefined
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
      <Stat icon={<Blocks className="size-5" />} label={t("blockHeight")} value={latest !== undefined ? format.number(latest) : undefined} />
      <Stat
        icon={<Clock className="size-5" />}
        label={t("avgBlockTime")}
        value={avgBlockTime !== undefined ? t("seconds", { value: format.number(avgBlockTime, { maximumFractionDigits: 1 }) }) : undefined}
      />
      <Stat icon={<Cpu className="size-5" />} label={t("hashrate")} value={hashrate !== undefined ? formatHashrate(hashrate, locale) : undefined} />
      <Stat
        icon={<Mountain className="size-5" />}
        label={t("difficulty")}
        value={blocks?.[0] ? format.number(hexToBigInt(blocks[0].difficulty)) : undefined}
      />
      <Stat
        icon={<Fuel className="size-5" />}
        label={t("gasPrice")}
        value={gasPrice ? `${formatUnitsLocale(hexToBigInt(gasPrice), 9, locale, 3)} Gwei` : undefined}
      />
      <Stat
        icon={<Hourglass className="size-5" />}
        label={t("pendingTxs")}
        value={pool.isError ? "—" : pool.data ? format.number(hexToNumber(pool.data.pending)) : undefined}
      />
    </div>
  )
}
