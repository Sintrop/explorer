"use client"

import React, { JSX, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Search as SearchIcon } from "lucide-react"
import { detectInputType } from "@/utils/detectInputType"
import { getBlock, getTransaction } from "@/services/chain"
import { cn } from "@/lib/utils"

interface Props {
  variant?: "hero" | "compact"
}

export function Search({ variant = "hero" }: Props): JSX.Element {
  const t = useTranslations("search")
  const router = useRouter()
  const [input, setInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  async function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const value = input.trim()
    const type = detectInputType(value)

    if (type === "unknown") {
      setError(t("invalid"))
      return
    }
    if (type === "address") return router.push(`/address/${value}`)
    if (type === "blockNumber") return router.push(`/block/${value}`)

    setIsSearching(true)
    try {
      if (await getTransaction(value)) return router.push(`/tx/${value}`)
      if (await getBlock(value)) return router.push(`/block/${value}`)
      setError(t("notFound"))
    } catch {
      // The RPC failed: let the transaction page show the error state.
      router.push(`/tx/${value}`)
    } finally {
      setIsSearching(false)
    }
  }

  const hero = variant === "hero"

  return (
    <form
      role="search"
      className={cn("flex w-full flex-col gap-2", hero ? "mx-auto mt-6 mb-14 max-w-3xl" : "max-w-xl")}
      onSubmit={handleSearch}
    >
      <label htmlFor={`search-${variant}`} className={hero ? "text-sm text-gray-600" : "sr-only"}>
        {t("label")}
      </label>
      <div className="flex w-full gap-2">
        <div className="relative flex-1 min-w-0">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" aria-hidden />
          <input
            id={`search-${variant}`}
            className={cn(
              "w-full rounded-full border border-gray-300 pl-9 pr-3 focus:border-gray-500 focus:outline-none",
              hero ? "h-12" : "h-10 text-sm",
            )}
            placeholder={t("placeholder")}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setError(null)
            }}
            aria-invalid={!!error}
            aria-describedby={error ? `search-${variant}-error` : undefined}
            spellCheck={false}
            autoComplete="off"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className={cn(
            "shrink-0 rounded-full bg-gray-200 px-5 duration-300 hover:cursor-pointer hover:bg-gray-300 disabled:opacity-60",
            hero ? "h-12" : "h-10 text-sm",
          )}
        >
          {isSearching ? t("searching") : t("submit")}
        </button>
      </div>
      {error && (
        <p id={`search-${variant}-error`} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  )
}
