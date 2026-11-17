"use client"

import { JSX } from "react"
import { useFormatter, useTranslations } from "next-intl"
import { useLatestBlock } from "@/hooks/useLatestBlock"
import { hexToBigInt } from "@/lib/format"
import { AddressLink, TxLink } from "@/components/Links"
import { Amount } from "@/components/Amount"

export function TxsInTheLatestBlock(): JSX.Element {
  const t = useTranslations("home")
  const format = useFormatter()
  const { data: block } = useLatestBlock()

  return (
    <section className="flex w-full min-w-0 flex-col gap-2">
      <h2 className="text-gray-700">
        {t("txsInBlock", { number: block ? format.number(hexToBigInt(block.number)) : "…" })}
      </h2>

      {block && block.transactions.length === 0 && <p className="text-sm text-gray-500">{t("noTxs")}</p>}

      {block && block.transactions.length > 0 && (
        <ul className="flex flex-col divide-y rounded-2xl border">
          {block.transactions.map((tx) => (
            <li key={tx.hash} className="flex flex-col gap-1 p-3 text-sm">
              <TxLink hash={tx.hash} short />
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <AddressLink address={tx.from} short />
                <span className="text-gray-400">→</span>
                {tx.to ? <AddressLink address={tx.to} short /> : <span className="text-gray-500">—</span>}
                <span className="ml-auto">
                  <Amount value={hexToBigInt(tx.value)} maxFractionDigits={4} />
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
