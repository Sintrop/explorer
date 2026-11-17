"use client"

import { JSX } from "react"
import { useLocale } from "next-intl"
import { formatUnitsLocale } from "@/lib/format"
import { network } from "@/config/network"

interface Props {
  value: bigint
  decimals?: number
  symbol?: string
  maxFractionDigits?: number
}

export function Amount({ value, decimals = network.coinDecimals, symbol = network.coinName, maxFractionDigits = 6 }: Props): JSX.Element {
  const locale = useLocale()
  return (
    <span className="tabular-nums">
      {formatUnitsLocale(value, decimals, locale, maxFractionDigits)}{symbol ? ` ${symbol}` : ""}
    </span>
  )
}
