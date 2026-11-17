"use client"

import { JSX } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { useFormatter, useTranslations } from "next-intl"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { decodeRlp, toUtf8String } from "ethers"
import { getBlockWithTxs } from "@/services/chain"
import { useLatestBlockNumber } from "@/hooks/useChain"
import { hexToBigInt, hexToNumber } from "@/lib/format"
import { cn } from "@/lib/utils"
import { DataItem, DataList } from "@/components/DataItem"
import { AddressLink, BlockLink } from "@/components/Links"
import { HashValue } from "@/components/HashValue"
import { Timestamp } from "@/components/Timestamp"
import { TxTable } from "@/components/TxTable"
import { PageTitle } from "@/components/Screen"
import { Card, CardBody, CardHeader } from "@/components/ui/Card"
import { EmptyState, Loading, NotFoundMessage, RpcErrorMessage } from "@/components/QueryState"

function decodeExtraData(hex: string): string {
  // geth-style extraData is RLP: [version, client, go version, os]
  try {
    const items = decodeRlp(hex)
    if (Array.isArray(items) && items.every((item) => typeof item === "string")) {
      const [version, ...rest] = items as string[]
      const v = Number(BigInt(version === "0x" ? 0 : version))
      const parts = rest.map((item) => toUtf8String(item))
      return [parts[0], `v${v >> 16}.${(v >> 8) & 0xff}.${v & 0xff}`, ...parts.slice(1)].join(" · ")
    }
  } catch {
    // not RLP, fall through
  }
  try {
    const text = toUtf8String(hex).replace(/[^\x20-\x7e]+/g, " ").trim()
    return text || hex
  } catch {
    return hex
  }
}

function NavButton({ href, label, children }: { href?: string; label: string; children: React.ReactNode }): JSX.Element {
  const className = "inline-flex size-9 items-center justify-center rounded-full border bg-card"
  if (!href) {
    return (
      <span className={cn(className, "opacity-40")} aria-disabled title={label}>
        {children}
      </span>
    )
  }
  return (
    <Link href={href} className={cn(className, "hover:bg-muted")} title={label} aria-label={label}>
      {children}
    </Link>
  )
}

export function BlockData({ block }: { block: string }): JSX.Element {
  const t = useTranslations("block")
  const format = useFormatter()
  const { data: latest } = useLatestBlockNumber()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["blockFull", block],
    queryFn: () => getBlockWithTxs(block),
  })

  if (isLoading) {
    return (
      <Card>
        <Loading />
      </Card>
    )
  }
  if (isError) {
    return (
      <Card>
        <RpcErrorMessage onRetry={() => refetch()} />
      </Card>
    )
  }
  if (!data) {
    return (
      <Card>
        <NotFoundMessage title={t("notFound")} hint={t("notFoundHint")} />
      </Card>
    )
  }

  const number = hexToNumber(data.number)
  const gasUsed = hexToBigInt(data.gasUsed)
  const gasLimit = hexToBigInt(data.gasLimit)
  const gasPercent = gasLimit > BigInt(0) ? Number((gasUsed * BigInt(10000)) / gasLimit) / 10000 : 0

  return (
    <>
      <PageTitle
        title={t("title", { number: format.number(number) })}
        actions={
          <>
            <NavButton href={number > 0 ? `/block/${number - 1}` : undefined} label={t("prev")}>
              <ChevronLeft className="size-4" />
            </NavButton>
            <NavButton href={latest !== undefined && number < latest ? `/block/${number + 1}` : undefined} label={t("next")}>
              <ChevronRight className="size-4" />
            </NavButton>
          </>
        }
      />

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader title={t("overview")} />
          <CardBody>
            <DataList>
              <DataItem label={t("hash")}>
                <HashValue value={data.hash} />
              </DataItem>
              <DataItem label={t("timestamp")}>
                <Timestamp seconds={hexToNumber(data.timestamp)} />
              </DataItem>
              <DataItem label={t("miner")}>
                <AddressLink address={data.miner} copy />
              </DataItem>
              <DataItem label={t("transactions")}>{format.number(data.transactions.length)}</DataItem>
              <DataItem label={t("gasUsed")}>
                <div className="flex flex-col gap-1.5">
                  <span>
                    {format.number(gasUsed)}{" "}
                    <span className="text-muted-foreground">({format.number(gasPercent, { style: "percent", maximumFractionDigits: 2 })})</span>
                  </span>
                  <span className="h-1.5 w-48 overflow-hidden rounded-full bg-muted">
                    <span className="block h-full rounded-full bg-primary" style={{ width: `${Math.max(gasPercent * 100, gasUsed > BigInt(0) ? 1 : 0)}%` }} />
                  </span>
                </div>
              </DataItem>
              <DataItem label={t("gasLimit")}>{format.number(gasLimit)}</DataItem>
              <DataItem label={t("difficulty")}>{format.number(hexToBigInt(data.difficulty))}</DataItem>
              {data.totalDifficulty && <DataItem label={t("totalDifficulty")}>{format.number(hexToBigInt(data.totalDifficulty))}</DataItem>}
              <DataItem label={t("size")}>{t("bytes", { size: format.number(hexToNumber(data.size)) })}</DataItem>
              <DataItem label={t("parentHash")}>
                {number > 0 ? <BlockLink block={number - 1} label={data.parentHash} /> : <HashValue value={data.parentHash} />}
              </DataItem>
              <DataItem label={t("extraData")}>{decodeExtraData(data.extraData)}</DataItem>
            </DataList>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={t("txList")} action={format.number(data.transactions.length)} />
          <CardBody>
            {data.transactions.length === 0 ? (
              <EmptyState>{t("noTxs")}</EmptyState>
            ) : (
              <TxTable rows={data.transactions.map((tx) => ({ tx }))} showBlock={false} />
            )}
          </CardBody>
        </Card>
      </div>
    </>
  )
}
