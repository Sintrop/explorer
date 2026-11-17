"use client"

import { JSX } from "react"
import { ArrowRight } from "lucide-react"
import { TokenTransfer } from "@/lib/decode"
import { TransferParty } from "@/components/Links"
import { useTranslations } from "next-intl"
import { TokenAmount } from "@/components/TokenAmount"

export function TokenTransfers({ transfers }: { transfers: TokenTransfer[] }): JSX.Element {
  const tt = useTranslations("token")
  const label = { burn: tt("burn"), mint: tt("mint") }
  return (
    <ul className="flex flex-col gap-2">
      {transfers.map((t, i) => (
        <li key={i} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <TransferParty address={t.from} kind="from" label={label} />
          <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <TransferParty address={t.to} kind="to" label={label} />
          <span className="font-medium">
            <TokenAmount token={t.token} value={t.value} maxFractionDigits={4} />
          </span>
        </li>
      ))}
    </ul>
  )
}
