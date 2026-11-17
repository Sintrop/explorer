"use client"

import { JSX } from "react"
import { useFormatter, useTranslations } from "next-intl"
import { useRecentBlocks } from "@/hooks/useChain"
import { Card, CardBody, CardHeader } from "@/components/ui/Card"
import { AddressLink } from "@/components/Links"
import { RECENT_WINDOW } from "./recent"

export function RecentMiners(): JSX.Element | null {
  const t = useTranslations("home")
  const format = useFormatter()
  const { data } = useRecentBlocks(RECENT_WINDOW)

  if (!data || data.length === 0) return null

  const counts = new Map<string, number>()
  for (const block of data) counts.set(block.miner, (counts.get(block.miner) ?? 0) + 1)
  const miners = [...counts.entries()].sort((a, b) => b[1] - a[1])
  const minutes = Math.round((RECENT_WINDOW * 12.7) / 60)

  return (
    <Card>
      <CardHeader title={t("miners")} action={t("window", { count: data.length, minutes })} />
      <CardBody className="py-4">
        <ul className="flex flex-col gap-3">
          {miners.map(([miner, count]) => {
            const share = count / data.length
            return (
              <li key={miner} className="flex flex-col gap-1.5 text-sm sm:flex-row sm:items-center sm:gap-4">
                <AddressLink address={miner} className="sm:w-[26rem] sm:shrink-0" />
                <div className="flex flex-1 items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${share * 100}%` }} />
                  </div>
                  <span className="w-36 shrink-0 text-right text-muted-foreground tabular-nums">
                    {format.number(share, { style: "percent", maximumFractionDigits: 1 })} · {t("minerShare", { count })}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      </CardBody>
    </Card>
  )
}
