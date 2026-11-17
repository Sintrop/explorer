"use client"

import { JSX } from "react"
import { useQuery } from "@tanstack/react-query"
import { useFormatter, useTranslations } from "next-intl"
import { getBlock, getLatestBlockNumber, getReceipt, getTransaction } from "@/services/chain"
import { hexToBigInt, hexToNumber } from "@/lib/format"
import { network } from "@/config/network"
import { DataItem, DataList } from "@/components/DataItem"
import { AddressLink, BlockLink } from "@/components/Links"
import { Amount } from "@/components/Amount"
import { Timestamp } from "@/components/Timestamp"
import { StatusTx } from "@/components/StatusTx"
import { Loading, NotFoundMessage, RpcErrorMessage } from "@/components/QueryState"
import { RevertReason } from "./RevertReason"

export function TransactionDetails({ hash }: { hash: string }): JSX.Element {
  const t = useTranslations("tx")
  const format = useFormatter()

  const txQuery = useQuery({
    queryKey: ["tx", hash],
    queryFn: () => getTransaction(hash),
    // keep polling while the transaction is pending
    refetchInterval: (query) => (query.state.data && !query.state.data.blockNumber ? network.refetchInterval : false),
  })
  const tx = txQuery.data
  const isMined = !!tx?.blockNumber

  const receiptQuery = useQuery({
    queryKey: ["receipt", hash],
    queryFn: () => getReceipt(hash),
    enabled: isMined,
    staleTime: Infinity,
  })

  const blockQuery = useQuery({
    queryKey: ["block", tx?.blockNumber],
    queryFn: () => getBlock(tx!.blockNumber!),
    enabled: isMined,
    staleTime: Infinity,
  })

  const latestQuery = useQuery({
    queryKey: ["blockNumber"],
    queryFn: getLatestBlockNumber,
    enabled: isMined,
    refetchInterval: network.refetchInterval,
  })

  if (txQuery.isLoading) return <Loading />
  if (txQuery.isError) return <RpcErrorMessage onRetry={() => txQuery.refetch()} />
  if (!tx) return <NotFoundMessage title={t("notFound")} />

  const receipt = receiptQuery.data
  const status = !isMined ? "pending" : receipt ? (hexToNumber(receipt.status) === 1 ? "success" : "failed") : null

  const blockNumber = tx.blockNumber ? hexToBigInt(tx.blockNumber) : null
  const latest = latestQuery.data ? hexToBigInt(latestQuery.data) : null
  const confirmations = blockNumber !== null && latest !== null && latest >= blockNumber ? latest - blockNumber + BigInt(1) : null

  const gasPrice = hexToBigInt(receipt?.effectiveGasPrice ?? tx.gasPrice)
  const fee = receipt ? hexToBigInt(receipt.gasUsed) * gasPrice : null

  return (
    <DataList>
      <DataItem label={t("status")}>
        <div className="flex flex-col gap-2">
          {status ? <StatusTx status={status} /> : <span className="text-gray-500">…</span>}
          {status === "pending" && <p className="text-sm text-gray-500">{t("pendingHint")}</p>}
        </div>
      </DataItem>

      {status === "failed" && (
        <DataItem label={t("revertReason")}>
          <RevertReason hash={hash} />
        </DataItem>
      )}

      {blockNumber !== null && (
        <DataItem label={t("block")}>
          <BlockLink block={blockNumber} label={format.number(blockNumber)} />
          {confirmations !== null && (
            <span className="ml-2 text-sm text-gray-500">{t("confirmations", { count: Number(confirmations) })}</span>
          )}
        </DataItem>
      )}

      {blockQuery.data && (
        <DataItem label={t("timestamp")}>
          <Timestamp seconds={hexToNumber(blockQuery.data.timestamp)} />
        </DataItem>
      )}

      <DataItem label={t("from")}>
        <AddressLink address={tx.from} />
      </DataItem>

      {tx.to ? (
        <DataItem label={t("to")}>
          <AddressLink address={tx.to} />
        </DataItem>
      ) : (
        receipt?.contractAddress && (
          <DataItem label={t("contractCreated")}>
            <AddressLink address={receipt.contractAddress} />
          </DataItem>
        )
      )}

      <DataItem label={t("value")}>
        <Amount value={hexToBigInt(tx.value)} maxFractionDigits={18} />
      </DataItem>

      {fee !== null && (
        <DataItem label={t("fee")}>
          <Amount value={fee} maxFractionDigits={18} />
        </DataItem>
      )}

      <DataItem label={t("gasPrice")}>
        <Amount value={gasPrice} decimals={9} symbol="Gwei" maxFractionDigits={9} />
      </DataItem>

      <DataItem label={t("gasUsage")}>
        {receipt ? format.number(hexToBigInt(receipt.gasUsed)) : "…"} / {format.number(hexToBigInt(tx.gas))}
      </DataItem>

      <DataItem label={t("nonce")}>{format.number(hexToBigInt(tx.nonce))}</DataItem>

      {tx.transactionIndex && <DataItem label={t("position")}>{hexToNumber(tx.transactionIndex)}</DataItem>}

      <DataItem label={t("input")}>
        <pre className="max-h-48 overflow-auto rounded-lg bg-gray-50 p-3 font-mono text-xs break-all whitespace-pre-wrap">
          {tx.input}
        </pre>
      </DataItem>
    </DataList>
  )
}
