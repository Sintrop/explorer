"use client"

import { JSX } from "react"
import { useQuery } from "@tanstack/react-query"
import { useFormatter, useTranslations } from "next-intl"
import { toUtf8String } from "ethers"
import { getBlock } from "@/services/chain"
import { hexToBigInt, hexToNumber } from "@/lib/format"
import { DataItem, DataList } from "@/components/DataItem"
import { AddressLink, BlockLink, TxLink } from "@/components/Links"
import { Timestamp } from "@/components/Timestamp"
import { Loading, NotFoundMessage, RpcErrorMessage } from "@/components/QueryState"

function decodeExtraData(hex: string): string {
  try {
    // geth-style extraData is RLP; keep only the printable characters
    const text = toUtf8String(hex, () => 0).replace(/[^\x20-\x7e]+/g, " ").trim()
    return text || hex
  } catch {
    return hex
  }
}

export function BlockData({ block }: { block: string }): JSX.Element {
  const t = useTranslations("block")
  const format = useFormatter()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["block", block],
    queryFn: () => getBlock(block),
  })

  if (isLoading) return <Loading />
  if (isError) return <RpcErrorMessage onRetry={() => refetch()} />
  if (!data) return <NotFoundMessage title={t("notFound")} hint={t("notFoundHint")} />

  const number = hexToBigInt(data.number)
  const gasUsed = hexToBigInt(data.gasUsed)
  const gasLimit = hexToBigInt(data.gasLimit)
  const gasPercent = gasLimit > BigInt(0) ? Number((gasUsed * BigInt(10000)) / gasLimit) / 10000 : 0

  return (
    <>
      <h1 className="text-3xl font-bold sm:text-4xl">{t("title", { number: format.number(number) })}</h1>

      <DataList>
        <DataItem label={t("hash")}>
          <span className="font-mono text-sm">{data.hash}</span>
        </DataItem>
        <DataItem label={t("timestamp")}>
          <Timestamp seconds={hexToNumber(data.timestamp)} />
        </DataItem>
        <DataItem label={t("miner")}>
          <AddressLink address={data.miner} />
        </DataItem>
        <DataItem label={t("transactions")}>
          {data.transactions.length === 0 ? (
            "0"
          ) : (
            <ul className="flex flex-col gap-1">
              {data.transactions.map((hash) => (
                <li key={hash}>
                  <TxLink hash={hash} />
                </li>
              ))}
            </ul>
          )}
        </DataItem>
        <DataItem label={t("parentHash")}>
          {number > BigInt(0) ? (
            <BlockLink block={number - BigInt(1)} label={data.parentHash} />
          ) : (
            <span className="font-mono text-sm">{data.parentHash}</span>
          )}
        </DataItem>
        <DataItem label={t("gasUsed")}>
          {format.number(gasUsed)}{" "}
          <span className="text-gray-500">({format.number(gasPercent, { style: "percent", maximumFractionDigits: 2 })})</span>
        </DataItem>
        <DataItem label={t("gasLimit")}>{format.number(gasLimit)}</DataItem>
        <DataItem label={t("difficulty")}>{format.number(hexToBigInt(data.difficulty))}</DataItem>
        {data.totalDifficulty && (
          <DataItem label={t("totalDifficulty")}>{format.number(hexToBigInt(data.totalDifficulty))}</DataItem>
        )}
        <DataItem label={t("size")}>{t("bytes", { size: format.number(hexToNumber(data.size)) })}</DataItem>
        <DataItem label={t("extraData")}>{decodeExtraData(data.extraData)}</DataItem>
      </DataList>
    </>
  )
}
