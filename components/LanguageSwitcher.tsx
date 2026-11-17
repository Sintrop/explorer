"use client"

import { JSX, useTransition } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { Languages } from "lucide-react"
import { localeCookie, locales } from "@/i18n/config"

const labels: Record<string, string> = { pt: "PT", en: "EN" }
const names: Record<string, string> = { pt: "Português", en: "English" }

export function LanguageSwitcher(): JSX.Element {
  const t = useTranslations("common")
  const locale = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleChange(value: string) {
    document.cookie = `${localeCookie}=${value}; path=/; max-age=31536000; samesite=lax`
    startTransition(() => router.refresh())
  }

  return (
    <label className="inline-flex h-9 items-center gap-1 rounded-full px-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
      <Languages className="size-4" aria-hidden />
      <span className="sr-only">{t("language")}</span>
      <select
        className="bg-transparent font-medium hover:cursor-pointer focus:outline-none disabled:opacity-50"
        value={locale}
        title={names[locale]}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value)}
      >
        {locales.map((l) => (
          <option key={l} value={l} className="bg-card text-foreground">
            {labels[l]}
          </option>
        ))}
      </select>
    </label>
  )
}
