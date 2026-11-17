"use client"

import { JSX } from "react"
import { useTranslations } from "next-intl"
import { ArrowRight } from "lucide-react"
import { TxProps } from "@/types/tx"
import { hexToBigInt, hexToNumber } from "@/lib/format"
import { AddressLink, BlockLink, TxLink } from "./Links"
import { Amount } from "./Amount"
import { Age } from "./Timestamp"

export interface TxRow {
  tx: TxProps
  timestamp?: string
}

/** Responsive list of transactions: a table on desktop, stacked rows on mobile. */
export function TxTable({ rows, showBlock = true }: { rows: TxRow[]; showBlock?: boolean }): JSX.Element {
  const t = useTranslations("home")
  const tb = useTranslations("block")

  return (
    <div className="flex flex-col divide-y">
      <div className="hidden grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)_minmax(0,1fr)] gap-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid">
        <span>{t("colHash")}</span>
        <span>
          {t("colFrom")} / {t("colTo")}
        </span>
        <span className="text-right">{t("colValue")}</span>
      </div>
      {rows.map(({ tx, timestamp }) => (
        <div key={tx.hash} className="grid grid-cols-1 gap-2 py-3 text-sm md:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)_minmax(0,1fr)] md:items-center md:gap-4">
          <div className="flex min-w-0 flex-col gap-0.5">
            <TxLink hash={tx.hash} short />
            <span className="flex gap-2 text-xs text-muted-foreground">
              {showBlock && tx.blockNumber && <BlockLink block={hexToNumber(tx.blockNumber)} />}
              {timestamp && <Age seconds={hexToNumber(timestamp)} />}
            </span>
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <AddressLink address={tx.from} short />
            <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            {tx.to ? <AddressLink address={tx.to} short /> : <span className="text-muted-foreground">{tb("contractCreation")}</span>}
          </div>
          <div className="md:text-right">
            <Amount value={hexToBigInt(tx.value)} maxFractionDigits={4} />
          </div>
        </div>
      ))}
    </div>
  )
}
