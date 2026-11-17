"use client"

import { JSX, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { ArrowRight } from "lucide-react"
import { traceTransaction } from "@/services/chain"
import { CallTraceProps } from "@/types/tx"
import { decodeCall } from "@/lib/decode"
import { hexToBigInt } from "@/lib/format"
import { AddressLink } from "@/components/Links"
import { Amount } from "@/components/Amount"
import { MethodBadge } from "@/components/ArgValue"
import { EmptyState, Loading } from "@/components/QueryState"

interface FlatCall {
  call: CallTraceProps
  depth: number
}

function flatten(call: CallTraceProps, depth = 0, out: FlatCall[] = []): FlatCall[] {
  for (const child of call.calls ?? []) {
    out.push({ call: child, depth })
    flatten(child, depth + 1, out)
  }
  return out
}

function InternalCallsList({ hash }: { hash: string }): JSX.Element {
  const t = useTranslations("tx")
  const { data, isLoading, isError } = useQuery({
    queryKey: ["trace", hash],
    queryFn: () => traceTransaction(hash),
    staleTime: Infinity,
    retry: false,
  })

  if (isLoading) return <Loading rows={4} />
  if (isError || !data) return <EmptyState>{t("traceUnavailable")}</EmptyState>

  const calls = flatten(data)
  if (calls.length === 0) return <EmptyState>{t("noInternalCalls")}</EmptyState>

  return (
    <ol className="flex flex-col divide-y">
      {calls.map(({ call, depth }, i) => {
        const decoded = decodeCall(call.to, call.input)
        const value = hexToBigInt(call.value)
        return (
          <li key={i} className="flex flex-col gap-1.5 py-3 text-sm" style={{ paddingLeft: `${Math.min(depth, 6) * 1.25}rem` }}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">{call.type}</span>
              {decoded ? <MethodBadge name={decoded.name} /> : call.input?.length >= 10 && <MethodBadge name={call.input.slice(0, 10)} />}
              {call.error && <span className="text-xs text-danger">{call.error}</span>}
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <AddressLink address={call.from} short />
              <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              {call.to ? <AddressLink address={call.to} short /> : <span className="text-muted-foreground">—</span>}
              {value > BigInt(0) && (
                <span className="font-medium">
                  <Amount value={value} maxFractionDigits={6} />
                </span>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export function InternalCalls({ hash }: { hash: string }): JSX.Element {
  const t = useTranslations("tx")
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <div className="py-4">
        <button onClick={() => setOpen(true)} className="rounded-full border px-4 py-1.5 text-sm hover:cursor-pointer hover:bg-muted">
          {t("loadInternalCalls")}
        </button>
      </div>
    )
  }
  return <InternalCallsList hash={hash} />
}
