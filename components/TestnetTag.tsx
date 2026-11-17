import { JSX } from "react"
import { useTranslations } from "next-intl"

export function TestnetTag({ txWarning }: { txWarning?: boolean }): JSX.Element {
  const t = useTranslations("common")

  if (txWarning) {
    return (
      <div className="mt-6 w-fit rounded-2xl bg-red-300 px-5 py-3">
        <p className="text-black">{t("testnetTx")}</p>
      </div>
    )
  }

  return (
    <div className="w-fit rounded-2xl bg-red-300 px-4 py-1">
      <p className="text-sm text-black">{t("testnet")}</p>
    </div>
  )
}
