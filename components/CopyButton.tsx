"use client"

import { JSX, useState } from "react"
import { useTranslations } from "next-intl"
import { Check, Copy } from "lucide-react"

export function CopyButton({ value }: { value: string }): JSX.Element {
  const t = useTranslations("common")
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable (insecure context): nothing to do
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? t("copied") : t("copy")}
      aria-label={copied ? t("copied") : t("copy")}
      className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:cursor-pointer hover:bg-muted hover:text-foreground"
    >
      {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
    </button>
  )
}
