"use client"

import { JSX } from "react"
import { useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { traceTransaction } from "@/services/chain"
import { decodeRevert } from "@/lib/revert"
import { decodeCustomError } from "@/lib/decode"
import { ArgList, MethodBadge } from "@/components/ArgValue"

export function RevertReason({ hash }: { hash: string }): JSX.Element {
  const t = useTranslations("tx")
  const { data, isLoading, isError } = useQuery({
    queryKey: ["trace", hash],
    queryFn: () => traceTransaction(hash),
    staleTime: Infinity,
    retry: false,
  })

  if (isLoading) return <span className="text-muted-foreground">…</span>
  if (isError || !data) return <span className="text-muted-foreground">{t("traceUnavailable")}</span>

  if (data.revertReason) return <span className="text-danger">{data.revertReason}</span>

  const decoded = decodeRevert(data.output)

  switch (decoded.kind) {
    case "error":
      return <span className="text-danger">{decoded.message}</span>
    case "panic":
      return <span className="text-danger">{t("panic", { message: decoded.message })}</span>
    case "custom": {
      const known = decodeCustomError(decoded.data)
      if (known) {
        return (
          <span className="flex flex-col gap-2">
            <span className="flex items-center gap-2 text-danger">
              <MethodBadge name={known.name} />
            </span>
            {known.args.length > 0 && <ArgList args={known.args} />}
          </span>
        )
      }
      return (
        <span className="flex flex-col gap-1">
          <span className="text-danger">{t("customError", { selector: decoded.selector })}</span>
          <span className="font-mono text-xs text-muted-foreground">{decoded.data}</span>
        </span>
      )
    }
    default:
      return <span className="text-muted-foreground">{data.error ? `${data.error}. ` : ""}{t("noReason")}</span>
  }
}
