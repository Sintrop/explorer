"use client"

import { JSX } from "react"
import { useTranslations } from "next-intl"
import { SearchX, WifiOff } from "lucide-react"
import { SkeletonRows } from "./ui/Skeleton"

export function Loading({ rows = 8 }: { rows?: number }): JSX.Element {
  const t = useTranslations("common")
  return (
    <div className="px-4 sm:px-5">
      <span className="sr-only">{t("loading")}</span>
      <SkeletonRows rows={rows} />
    </div>
  )
}

export function RpcErrorMessage({ onRetry }: { onRetry?: () => void }): JSX.Element {
  const t = useTranslations("common")
  return (
    <div className="flex flex-col items-start gap-3 px-4 py-8 sm:px-5" role="alert">
      <p className="flex items-center gap-2 text-danger">
        <WifiOff className="size-4" aria-hidden />
        {t("rpcError")}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="rounded-full border px-4 py-1.5 text-sm hover:cursor-pointer hover:bg-muted">
          {t("retry")}
        </button>
      )}
    </div>
  )
}

export function NotFoundMessage({ title, hint }: { title: string; hint?: string }): JSX.Element {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-14 text-center">
      <SearchX className="size-10 text-muted-foreground" aria-hidden />
      <p className="text-xl font-semibold">{title}</p>
      {hint && <p className="text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function EmptyState({ children }: { children: React.ReactNode }): JSX.Element {
  return <p className="py-8 text-center text-sm text-muted-foreground">{children}</p>
}
