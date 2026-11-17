"use client"

import { JSX } from "react"
import Link from "next/link"
import { Amount } from "./Amount"
import { linkClass } from "./Links"
import { TOKEN_DECIMALS, TOKEN_SYMBOL, tokenContract } from "@/config/contracts/registry"

/** Amount of an ERC-20 token: formatted when it's the protocol token, raw otherwise. */
export function TokenAmount({ token, value, maxFractionDigits = 6 }: { token: string; value: bigint; maxFractionDigits?: number }): JSX.Element {
  const isRc = tokenContract && token.toLowerCase() === tokenContract.address.toLowerCase()

  if (isRc) {
    return (
      <span className="inline-flex items-baseline gap-1">
        <Amount value={value} decimals={TOKEN_DECIMALS} symbol="" maxFractionDigits={maxFractionDigits} />
        <Link href="/token" className={`${linkClass} font-medium`}>
          {TOKEN_SYMBOL}
        </Link>
      </span>
    )
  }

  return <span className="font-mono text-sm tabular-nums">{value.toString()}</span>
}
