"use client"

import { JSX } from "react"
import { useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { traceTransaction } from "@/services/chain"
import { decodeRevert } from "@/lib/revert"

export function RevertReason({ hash }: { hash: string }): JSX.Element {
  const t = useTranslations("tx")
  const { data, isLoading, isError } = useQuery({
    queryKey: ["trace", hash],
    queryFn: () => traceTransaction(hash),
    staleTime: Infinity,
    retry: false,
  })

  if (isLoading) return <span className="text-gray-500">…</span>
  if (isError || !data) return <span className="text-gray-500">{t("traceUnavailable")}</span>

  if (data.revertReason) return <span className="text-red-600">{data.revertReason}</span>

  const decoded = decodeRevert(data.output)

  switch (decoded.kind) {
    case "error":
      return <span className="text-red-600">{decoded.message}</span>
    case "panic":
      return <span className="text-red-600">{t("panic", { message: decoded.message })}</span>
    case "custom":
      return (
        <span className="flex flex-col gap-1">
          <span className="text-red-600">{t("customError", { selector: decoded.selector })}</span>
          <span className="font-mono text-xs text-gray-500">{decoded.data}</span>
        </span>
      )
    default:
      return <span className="text-gray-500">{data.error ? `${data.error}. ` : ""}{t("noReason")}</span>
  }
}
