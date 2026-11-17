"use client"

import { JSX } from "react"
import Link from "next/link"
import { useFormatter, useNow, useTranslations } from "next-intl"
import { useLatestBlock } from "@/hooks/useLatestBlock"
import { hexToBigInt, hexToNumber, shortenHash } from "@/lib/format"
import { IconAddress } from "@/components/IconAddress/IconAddress"

export function LatestBlock(): JSX.Element {
  const t = useTranslations("home")
  const format = useFormatter()
  const now = useNow({ updateInterval: 1000 })
  const { data: block } = useLatestBlock()

  const number = block ? hexToBigInt(block.number) : null

  return (
    <section className="flex shrink-0 flex-col gap-2">
      <h2 className="text-gray-700">{t("latestBlock")}</h2>

      <Link
        className="flex w-full flex-col gap-2 rounded-2xl border p-4 hover:border-gray-400 sm:w-64"
        href={number !== null ? `/block/${number}` : "#"}
        aria-busy={!block}
      >
        <p className="text-2xl font-bold tabular-nums">{number !== null ? format.number(number) : "…"}</p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">{t("miner")}:</span>
          {block && (
            <>
              <IconAddress address={block.miner} size={18} />
              <span className="font-mono">{shortenHash(block.miner, 6, 4)}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">{t("txs")}:</span>
          <span>{block?.transactions.length ?? "…"}</span>
        </div>
        <p className="text-sm text-gray-500">
          {block ? format.relativeTime(new Date(hexToNumber(block.timestamp) * 1000), now) : "…"}
        </p>
      </Link>
    </section>
  )
}
