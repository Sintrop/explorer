"use client"

import { JSX } from "react"
import { useQueries } from "@tanstack/react-query"
import { useFormatter, useTranslations } from "next-intl"
import { getBalance, getCode, getTransactionCount } from "@/services/chain"
import { hexToBigInt } from "@/lib/format"
import { DataItem, DataList } from "@/components/DataItem"
import { Amount } from "@/components/Amount"
import { Loading, RpcErrorMessage } from "@/components/QueryState"
import { Card, CardBody, CardHeader } from "@/components/ui/Card"
import { hasRegistry } from "@/config/contracts/registry"
import { ProtocolSection } from "./ProtocolSection"

export function AddressData({ address }: { address: string }): JSX.Element {
  const t = useTranslations("address")
  const format = useFormatter()

  const [balance, txCount, code] = useQueries({
    queries: [
      { queryKey: ["balance", address], queryFn: () => getBalance(address) },
      { queryKey: ["txCount", address], queryFn: () => getTransactionCount(address) },
      { queryKey: ["code", address], queryFn: () => getCode(address), staleTime: Infinity },
    ],
  })

  if (balance.isLoading || txCount.isLoading || code.isLoading) {
    return (
      <Card>
        <Loading rows={3} />
      </Card>
    )
  }
  if (balance.isError || txCount.isError || code.isError) {
    return (
      <Card>
        <RpcErrorMessage
          onRetry={() => {
            balance.refetch()
            txCount.refetch()
            code.refetch()
          }}
        />
      </Card>
    )
  }

  const isContract = !!code.data && code.data !== "0x"

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader title={t("overview")} />
        <CardBody>
          <DataList>
            <DataItem label={t("type")}>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-sm">{isContract ? t("contract") : t("account")}</span>
            </DataItem>
            <DataItem label={t("balance")}>
              <Amount value={hexToBigInt(balance.data)} maxFractionDigits={18} />
            </DataItem>
            <DataItem label={t("sentTxs")}>{format.number(hexToBigInt(txCount.data))}</DataItem>
          </DataList>
        </CardBody>
      </Card>
      {hasRegistry && <ProtocolSection address={address} />}
    </div>
  )
}
