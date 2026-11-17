"use client"

import { JSX } from "react"
import { useQuery } from "@tanstack/react-query"
import { useFormatter, useTranslations } from "next-intl"
import { getBlock, getReceipt, getTransaction } from "@/services/chain"
import { useLatestBlockNumber } from "@/hooks/useChain"
import { hexToBigInt, hexToNumber } from "@/lib/format"
import { network } from "@/config/network"
import { DataItem, DataList } from "@/components/DataItem"
import { AddressLink, BlockLink } from "@/components/Links"
import { Amount } from "@/components/Amount"
import { Timestamp } from "@/components/Timestamp"
import { StatusTx } from "@/components/StatusTx"
import { Loading, NotFoundMessage, RpcErrorMessage } from "@/components/QueryState"
import { Card, CardBody, CardHeader } from "@/components/ui/Card"
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

  const latestQuery = useLatestBlockNumber()

  if (txQuery.isLoading) {
    return (
      <Card>
        <Loading />
      </Card>
    )
  }
  if (txQuery.isError) {
    return (
      <Card>
        <RpcErrorMessage onRetry={() => txQuery.refetch()} />
      </Card>
    )
  }
  if (!tx) {
    return (
      <Card>
        <NotFoundMessage title={t("notFound")} />
      </Card>
    )
  }

  const receipt = receiptQuery.data
  const status = !isMined ? "pending" : receipt ? (hexToNumber(receipt.status) === 1 ? "success" : "failed") : null

  const blockNumber = tx.blockNumber ? hexToBigInt(tx.blockNumber) : null
  const latest = latestQuery.data !== undefined ? BigInt(latestQuery.data) : null
  const confirmations = blockNumber !== null && latest !== null && latest >= blockNumber ? latest - blockNumber + BigInt(1) : null

  const gasPrice = hexToBigInt(receipt?.effectiveGasPrice ?? tx.gasPrice)
  const fee = receipt ? hexToBigInt(receipt.gasUsed) * gasPrice : null

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader title={t("overview")} />
        <CardBody>
          <DataList>
            <DataItem label={t("status")}>
              <div className="flex flex-col gap-2">
                {status ? <StatusTx status={status} /> : <span className="text-muted-foreground">…</span>}
                {status === "pending" && <p className="text-sm text-muted-foreground">{t("pendingHint")}</p>}
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
                  <span className="ml-2 text-sm text-muted-foreground">{t("confirmations", { count: Number(confirmations) })}</span>
                )}
              </DataItem>
            )}

            {blockQuery.data && (
              <DataItem label={t("timestamp")}>
                <Timestamp seconds={hexToNumber(blockQuery.data.timestamp)} />
              </DataItem>
            )}

            <DataItem label={t("from")}>
              <AddressLink address={tx.from} copy />
            </DataItem>

            {tx.to ? (
              <DataItem label={t("to")}>
                <AddressLink address={tx.to} copy />
              </DataItem>
            ) : (
              receipt?.contractAddress && (
                <DataItem label={t("contractCreated")}>
                  <AddressLink address={receipt.contractAddress} copy />
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
          </DataList>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={t("details")} />
        <CardBody>
          <DataList>
            <DataItem label={t("gasPrice")}>
              <Amount value={gasPrice} decimals={9} symbol="Gwei" maxFractionDigits={9} />
            </DataItem>

            <DataItem label={t("gasUsage")}>
              {receipt ? format.number(hexToBigInt(receipt.gasUsed)) : isMined ? "…" : "—"} / {format.number(hexToBigInt(tx.gas))}
            </DataItem>

            <DataItem label={t("nonce")}>{format.number(hexToBigInt(tx.nonce))}</DataItem>

            {tx.transactionIndex && <DataItem label={t("position")}>{hexToNumber(tx.transactionIndex)}</DataItem>}

            <DataItem label={t("input")}>
              <pre className="max-h-48 overflow-auto rounded-lg bg-muted p-3 font-mono text-xs break-all whitespace-pre-wrap">
                {tx.input}
              </pre>
            </DataItem>
          </DataList>
        </CardBody>
      </Card>
    </div>
  )
}
