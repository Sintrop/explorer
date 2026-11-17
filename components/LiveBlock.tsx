"use client"

import { JSX } from "react"
import Link from "next/link"
import { useFormatter, useTranslations } from "next-intl"
import { useLatestBlockNumber } from "@/hooks/useChain"

export function LiveBlock(): JSX.Element | null {
  const t = useTranslations("common")
  const format = useFormatter()
  const { data, isError } = useLatestBlockNumber()

  if (data === undefined) return null

  return (
    <Link
      href={`/block/${data}`}
      title={t("latestBlock")}
      className="hidden items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground hover:bg-muted lg:inline-flex"
    >
      <span className={`size-2 rounded-full ${isError ? "bg-danger" : "animate-pulse bg-success"}`} aria-hidden />
      <span className="tabular-nums">#{format.number(data)}</span>
    </Link>
  )
}
