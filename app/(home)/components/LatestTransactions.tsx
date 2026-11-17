"use client"

import { JSX } from "react"
import { useTranslations } from "next-intl"
import { useRecentBlocks } from "@/hooks/useChain"
import { Card, CardBody, CardHeader } from "@/components/ui/Card"
import { TxTable, TxRow } from "@/components/TxTable"
import { EmptyState, Loading, RpcErrorMessage } from "@/components/QueryState"
import { RECENT_WINDOW } from "./recent"

export function LatestTransactions(): JSX.Element {
  const t = useTranslations("home")
  const { data, isError, refetch } = useRecentBlocks(RECENT_WINDOW)

  const rows: TxRow[] = []
  for (const block of data ?? []) {
    for (const tx of [...block.transactions].reverse()) {
      rows.push({ tx, timestamp: block.timestamp })
      if (rows.length === 10) break
    }
    if (rows.length === 10) break
  }

  const minutes = Math.round((RECENT_WINDOW * 12.7) / 60)

  return (
    <Card>
      <CardHeader title={t("latestTxs")} action={t("window", { count: RECENT_WINDOW, minutes })} />
      {isError && !data ? (
        <RpcErrorMessage onRetry={() => refetch()} />
      ) : !data ? (
        <Loading rows={10} />
      ) : (
        <CardBody>{rows.length === 0 ? <EmptyState>{t("noRecentTxs", { count: RECENT_WINDOW })}</EmptyState> : <TxTable rows={rows} />}</CardBody>
      )}
    </Card>
  )
}
