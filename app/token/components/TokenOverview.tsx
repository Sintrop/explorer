"use client"

import { JSX, ReactNode } from "react"
import { useQuery } from "@tanstack/react-query"
import { useFormatter, useTranslations } from "next-intl"
import { getAllTransfers, getTokenStats, holdersFromTransfers } from "@/services/protocol"
import { TOKEN_DECIMALS, TOKEN_SYMBOL } from "@/config/contracts/registry"
import { Card, CardBody, CardHeader } from "@/components/ui/Card"
import { Amount } from "@/components/Amount"
import { AddressLink } from "@/components/Links"
import { TransferTable } from "@/components/TransferTable"
import { Loading, RpcErrorMessage } from "@/components/QueryState"
import { Skeleton } from "@/components/ui/Skeleton"

function Stat({ label, hint, children }: { label: string; hint?: string; children?: ReactNode }): JSX.Element {
  return (
    <div className="min-w-0 rounded-xl border bg-card p-4 shadow-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-lg font-semibold tabular-nums">{children ?? <Skeleton className="h-5 w-32" />}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

const rc = (value: bigint) => <Amount value={value} decimals={TOKEN_DECIMALS} symbol={TOKEN_SYMBOL} maxFractionDigits={0} />

export function TokenOverview(): JSX.Element {
  const t = useTranslations("token")
  const format = useFormatter()
  const stats = useQuery({ queryKey: ["tokenStats"], queryFn: getTokenStats })
  const transfers = useQuery({ queryKey: ["allTransfers"], queryFn: getAllTransfers })

  const holders = transfers.data ? holdersFromTransfers(transfers.data) : undefined
  const supply = stats.data?.totalSupply
  const outsidePools = stats.data ? stats.data.totalSupply - stats.data.totalLocked : undefined

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label={t("totalSupply")} hint={t("totalSupplyHint")}>
          {stats.data && rc(stats.data.totalSupply)}
        </Stat>
        <Stat label={t("locked")} hint={t("lockedHint")}>
          {stats.data && rc(stats.data.totalLocked)}
        </Stat>
        <Stat label={t("outsidePools")} hint={t("outsidePoolsHint")}>
          {outsidePools !== undefined && rc(outsidePools)}
        </Stat>
        <Stat label={t("certified")} hint={t("certifiedHint")}>
          {stats.data && rc(stats.data.totalCertified)}
        </Stat>
        <Stat label={t("holders")} hint={t("holdersHint")}>
          {holders && format.number(holders.length)}
        </Stat>
      </div>
      {stats.isError && <RpcErrorMessage onRetry={() => stats.refetch()} />}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:items-start">
        <Card>
          <CardHeader title={t("topHolders")} />
          {transfers.isLoading ? (
            <Loading rows={10} />
          ) : transfers.isError ? (
            <RpcErrorMessage onRetry={() => transfers.refetch()} />
          ) : (
            <CardBody>
              <ol className="flex flex-col divide-y">
                {holders!.slice(0, 20).map((h, i) => {
                  const share = supply ? Number((h.balance * BigInt(1_000_000)) / supply) / 1_000_000 : undefined
                  return (
                    <li key={h.address} className="flex items-center gap-3 py-2.5 text-sm">
                      <span className="w-6 shrink-0 text-right text-xs text-muted-foreground tabular-nums">{i + 1}</span>
                      <span className="min-w-0 flex-1">
                        <AddressLink address={h.address} short />
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block font-medium">{rc(h.balance)}</span>
                        {share !== undefined && (
                          <span className="block text-xs text-muted-foreground">
                            {format.number(share, { style: "percent", maximumFractionDigits: 2 })}
                          </span>
                        )}
                      </span>
                    </li>
                  )
                })}
              </ol>
            </CardBody>
          )}
        </Card>

        <Card>
          <CardHeader title={t("recentTransfers")} action={transfers.data ? t("totalTransfers", { count: transfers.data.length }) : undefined} />
          {transfers.isLoading ? (
            <Loading rows={10} />
          ) : transfers.isError ? (
            <RpcErrorMessage onRetry={() => transfers.refetch()} />
          ) : (
            <CardBody>
              <TransferTable transfers={transfers.data!.slice(0, 20)} />
            </CardBody>
          )}
        </Card>
      </div>
    </div>
  )
}
