import { JSX } from "react"
import { useTranslations } from "next-intl"
import { TriangleAlert } from "lucide-react"

export function TestnetTag({ txWarning }: { txWarning?: boolean }): JSX.Element {
  const t = useTranslations("common")

  if (txWarning) {
    return (
      <div className="mb-6 flex w-fit items-center gap-2 rounded-lg bg-warning-soft px-4 py-2 text-sm text-warning">
        <TriangleAlert className="size-4" aria-hidden />
        {t("testnetTx")}
      </div>
    )
  }

  return <span className="rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-medium text-warning">{t("testnet")}</span>
}
