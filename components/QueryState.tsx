"use client"

import { JSX } from "react"
import { useTranslations } from "next-intl"

export function Loading(): JSX.Element {
  const t = useTranslations("common")
  return (
    <p className="mt-6 animate-pulse text-gray-500" role="status">
      {t("loading")}
    </p>
  )
}

export function RpcErrorMessage({ onRetry }: { onRetry?: () => void }): JSX.Element {
  const t = useTranslations("common")
  return (
    <div className="mt-6 flex flex-col items-start gap-3" role="alert">
      <p className="text-red-600">{t("rpcError")}</p>
      {onRetry && (
        <button onClick={onRetry} className="rounded-full bg-gray-200 px-4 py-2 text-sm hover:cursor-pointer hover:bg-gray-300">
          {t("retry")}
        </button>
      )}
    </div>
  )
}

export function NotFoundMessage({ title, hint }: { title: string; hint?: string }): JSX.Element {
  return (
    <div className="mt-10">
      <p className="text-3xl font-bold">{title}</p>
      {hint && <p className="mt-2 text-gray-500">{hint}</p>}
    </div>
  )
}
