"use client"

import { JSX } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useLatestBlockNumber } from "@/hooks/useChain"
import { getProtocolActivity } from "@/services/protocol"
import { getBlockTimestamps } from "@/services/chain"
import { Card, CardBody, CardHeader } from "@/components/ui/Card"
import { AddressLink, TxLink, linkClass } from "@/components/Links"
import { MethodBadge } from "@/components/ArgValue"
import { Age } from "@/components/Timestamp"
import { EmptyState, Loading, RpcErrorMessage } from "@/components/QueryState"

// ~73 days at ~12.7 s per block; a single eth_getLogs over all protocol contracts
const ACTIVITY_WINDOW = 500_000

export function ProtocolActivity(): JSX.Element {
  const t = useTranslations("home")
  const { data: latest } = useLatestBlockNumber()

  // refresh roughly every 10 blocks, not on every new block
  const bucket = latest !== undefined ? Math.floor(latest / 10) * 10 : undefined
  const activity = useQuery({
    queryKey: ["protocolActivity", bucket],
    queryFn: async () => {
      const events = (await getProtocolActivity(bucket!, ACTIVITY_WINDOW)).slice(0, 10)
      const timestamps = await getBlockTimestamps(events.map((e) => e.blockNumber))
      return events.map((e) => ({ ...e, timestamp: timestamps.get(e.blockNumber) }))
    },
    enabled: bucket !== undefined,
    staleTime: Infinity,
    placeholderData: (previous) => previous,
  })

  return (
    <Card>
      <CardHeader
        title={t("protocolActivity")}
        action={
          <Link href="/protocol" className={linkClass}>
            {t("viewContracts")}
          </Link>
        }
      />
      {activity.isError && !activity.data ? (
        <RpcErrorMessage onRetry={() => activity.refetch()} />
      ) : !activity.data ? (
        <Loading rows={10} />
      ) : activity.data.length === 0 ? (
        <CardBody>
          <EmptyState>{t("noProtocolActivity")}</EmptyState>
        </CardBody>
      ) : (
        <CardBody>
          <ul className="flex flex-col divide-y">
            {activity.data.map((event) => (
              <li key={`${event.transactionHash}:${event.logIndex}`} className="flex flex-col gap-1.5 py-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <MethodBadge name={event.name} />
                  <AddressLink address={event.address} short />
                </div>
                <div className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                  <TxLink hash={event.transactionHash} short />
                  {event.timestamp ? <Age seconds={event.timestamp} /> : null}
                </div>
              </li>
            ))}
          </ul>
        </CardBody>
      )}
    </Card>
  )
}
