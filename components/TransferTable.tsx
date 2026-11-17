"use client"

import { JSX } from "react"
import { useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { ArrowRight } from "lucide-react"
import { TransferEntry } from "@/services/protocol"
import { getBlockTimestamps } from "@/services/chain"
import { BlockLink, TransferParty, TxLink } from "./Links"
import { TokenAmount } from "./TokenAmount"
import { Age } from "./Timestamp"
import { cn } from "@/lib/utils"

/** Token transfers with direction relative to `perspective` (when given). */
export function TransferTable({ transfers, perspective }: { transfers: TransferEntry[]; perspective?: string }): JSX.Element {
  const t = useTranslations("token")
  const blocks = transfers.map((tr) => tr.blockNumber)
  const { data: timestamps } = useQuery({
    queryKey: ["timestamps", blocks.join(",")],
    queryFn: () => getBlockTimestamps(blocks),
    staleTime: Infinity,
    enabled: blocks.length > 0,
  })
  const me = perspective?.toLowerCase()
  const label = { burn: t("burn"), mint: t("mint") }

  return (
    <div className="flex flex-col divide-y">
      {transfers.map((tr) => {
        const direction = !me ? null : tr.from.toLowerCase() === me ? "out" : "in"
        const ts = timestamps?.get(tr.blockNumber)
        return (
          <div
            key={`${tr.transactionHash}:${tr.logIndex}`}
            className="grid grid-cols-1 gap-2 py-3 text-sm md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] md:items-center md:gap-4"
          >
            <div className="flex min-w-0 flex-col gap-0.5">
              <TxLink hash={tr.transactionHash} short />
              <span className="flex gap-2 text-xs text-muted-foreground">
                <BlockLink block={tr.blockNumber} />
                {ts ? <Age seconds={ts} /> : null}
              </span>
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              {direction && (
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase",
                    direction === "in" ? "bg-success-soft text-success" : "bg-warning-soft text-warning",
                  )}
                >
                  {t(direction)}
                </span>
              )}
              <TransferParty address={tr.from} kind="from" label={label} />
              <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <TransferParty address={tr.to} kind="to" label={label} />
            </div>
            <div className="font-medium md:text-right">
              <TokenAmount token={tr.token} value={tr.value} maxFractionDigits={4} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
