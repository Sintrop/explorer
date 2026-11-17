"use client"

import { JSX } from "react"
import { useFormatter, useTranslations } from "next-intl"
import { Box } from "lucide-react"
import { useRecentBlocks } from "@/hooks/useChain"
import { hexToNumber } from "@/lib/format"
import { Card, CardBody, CardHeader } from "@/components/ui/Card"
import { AddressLink, BlockLink } from "@/components/Links"
import { Age } from "@/components/Timestamp"
import { Loading, RpcErrorMessage } from "@/components/QueryState"
import { RECENT_WINDOW } from "./recent"

export function LatestBlocks(): JSX.Element {
  const t = useTranslations("home")
  const format = useFormatter()
  const { data, isError, refetch } = useRecentBlocks(RECENT_WINDOW)

  return (
    <Card>
      <CardHeader title={t("latestBlocks")} />
      {isError && !data ? (
        <RpcErrorMessage onRetry={() => refetch()} />
      ) : !data ? (
        <Loading rows={10} />
      ) : (
        <CardBody>
          <ul className="flex flex-col divide-y">
            {data.slice(0, 10).map((block) => {
              const number = hexToNumber(block.number)
              const txs = block.transactions.length
              return (
                <li key={block.hash} className="flex items-center gap-3 py-3 text-sm">
                  <div className="hidden size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground sm:flex">
                    <Box className="size-4" aria-hidden />
                  </div>
                  <div className="flex w-28 shrink-0 flex-col">
                    <BlockLink block={number} label={format.number(number)} />
                    <span className="text-xs text-muted-foreground">
                      <Age seconds={hexToNumber(block.timestamp)} />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">{t("colMiner")}</span>
                    <AddressLink address={block.miner} short />
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs ${txs > 0 ? "bg-accent font-medium text-accent-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    {t("txsCount", { count: txs })}
                  </span>
                </li>
              )
            })}
          </ul>
        </CardBody>
      )}
    </Card>
  )
}
