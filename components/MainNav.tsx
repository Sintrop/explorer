import { JSX } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { hasRegistry, tokenContract } from "@/config/contracts/registry"

export function MainNav(): JSX.Element {
  const t = useTranslations("nav")

  const itemClass = "rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
  return (
    <nav className="flex items-center">
      <Link href="/network" className={itemClass}>
        {t("network")}
      </Link>
      {hasRegistry && tokenContract && (
        <Link href="/token" className={itemClass}>
          {t("token")}
        </Link>
      )}
      {hasRegistry && (
        <Link href="/protocol" className={itemClass}>
          {t("protocol")}
        </Link>
      )}
    </nav>
  )
}
