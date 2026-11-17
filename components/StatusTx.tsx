import { JSX } from "react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

export type TxStatus = "success" | "failed" | "pending"

const styles: Record<TxStatus, string> = {
  success: "bg-green-600 text-white",
  failed: "bg-red-500 text-white",
  pending: "bg-amber-400 text-black",
}

export function StatusTx({ status }: { status: TxStatus }): JSX.Element {
  const t = useTranslations("tx")
  return <span className={cn("inline-block w-fit rounded-2xl px-4 py-1 text-sm font-bold", styles[status])}>{t(status)}</span>
}
