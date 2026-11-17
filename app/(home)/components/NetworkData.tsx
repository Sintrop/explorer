import { JSX } from "react"
import { useTranslations } from "next-intl"
import { network } from "@/config/network"

export function NetworkData(): JSX.Element {
  const t = useTranslations("home")

  const rows: [string, string][] = [
    [t("chainId"), network.chainId],
    [t("name"), network.networkName],
    [t("coin"), network.coinName],
    [t("rpc"), network.publicRpcUrl],
  ]

  return (
    <section className="flex w-full flex-col gap-2 lg:max-w-md">
      <h2 className="text-gray-700">{t("networkData")}</h2>
      <dl className="flex flex-col gap-1 rounded-2xl border p-4 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex gap-2">
            <dt className="text-gray-500">{label}:</dt>
            <dd className="break-all">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
