"use client"

import { JSX } from "react"
import { useQueries } from "@tanstack/react-query"
import { useFormatter, useTranslations } from "next-intl"
import { getBalance, getCode, getTransactionCount } from "@/services/chain"
import { hexToBigInt } from "@/lib/format"
import { DataItem, DataList } from "@/components/DataItem"
import { Amount } from "@/components/Amount"
import { Loading, RpcErrorMessage } from "@/components/QueryState"

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

  if (balance.isLoading || txCount.isLoading || code.isLoading) return <Loading />
  if (balance.isError || txCount.isError || code.isError) {
    return (
      <RpcErrorMessage
        onRetry={() => {
          balance.refetch()
          txCount.refetch()
          code.refetch()
        }}
      />
    )
  }

  const isContract = !!code.data && code.data !== "0x"

  return (
    <DataList>
      <DataItem label={t("type")}>{isContract ? t("contract") : t("account")}</DataItem>
      <DataItem label={t("balance")}>
        <Amount value={hexToBigInt(balance.data)} maxFractionDigits={18} />
      </DataItem>
      <DataItem label={t("sentTxs")}>{format.number(hexToBigInt(txCount.data))}</DataItem>
    </DataList>
  )
}
