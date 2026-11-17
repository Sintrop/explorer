import { JSX } from "react"
import { useTranslations } from "next-intl"
import { CircleCheck, CircleX, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export type TxStatus = "success" | "failed" | "pending"

const styles: Record<TxStatus, string> = {
  success: "bg-success-soft text-success",
  failed: "bg-danger-soft text-danger",
  pending: "bg-warning-soft text-warning",
}

const icons = { success: CircleCheck, failed: CircleX, pending: Clock }

export function StatusTx({ status }: { status: TxStatus }): JSX.Element {
  const t = useTranslations("tx")
  const Icon = icons[status]
  return (
    <span className={cn("inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium", styles[status])}>
      <Icon className="size-4" aria-hidden />
      {t(status)}
    </span>
  )
}
