import { JSX } from "react"
import { useTranslations } from "next-intl"
import { network } from "@/config/network"

export function Footer(): JSX.Element {
  const t = useTranslations("footer")

  return (
    <footer className="mt-auto border-t">
      <div className="container mx-auto flex flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p>
          {t("network", { name: network.networkName, chainId: network.chainId })}
          <span className="mx-2">·</span>
          {t("coin", { coin: network.coinName })}
        </p>
        <p className="break-all">
          {t("rpc")}: <span className="font-mono">{network.publicRpcUrl}</span>
        </p>
      </div>
    </footer>
  )
}
