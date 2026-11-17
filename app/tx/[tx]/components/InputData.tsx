"use client"

import { JSX } from "react"
import { useTranslations } from "next-intl"
import { DecodedCall } from "@/lib/decode"
import { ArgList, MethodBadge } from "@/components/ArgValue"

export function InputData({ input, decoded }: { input: string; decoded: DecodedCall | null }): JSX.Element {
  const t = useTranslations("tx")

  const raw = (
    <pre className="max-h-48 overflow-auto rounded-lg bg-muted p-3 font-mono text-xs break-all whitespace-pre-wrap">{input}</pre>
  )

  if (!decoded) return raw

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <MethodBadge name={decoded.name} />
        <span className="font-mono text-xs break-all text-muted-foreground">{decoded.signature}</span>
      </div>
      <ArgList args={decoded.args} />
      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">{t("rawInput")}</summary>
        <div className="mt-2">{raw}</div>
      </details>
    </div>
  )
}
