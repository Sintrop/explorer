"use client"

import { JSX, useTransition } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { Languages } from "lucide-react"
import { localeCookie, locales } from "@/i18n/config"

const labels: Record<string, string> = { pt: "Português", en: "English" }

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
    <label className="flex items-center gap-1 text-sm text-gray-600">
      <Languages className="size-4" aria-hidden />
      <span className="sr-only">{t("language")}</span>
      <select
        className="bg-transparent py-1 pr-1 hover:cursor-pointer disabled:opacity-50"
        value={locale}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value)}
      >
        {locales.map((l) => (
          <option key={l} value={l}>
            {labels[l]}
          </option>
        ))}
      </select>
    </label>
  )
}
