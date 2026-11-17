"use client"

import { JSX } from "react"
import { useTranslations } from "next-intl"
import { LogProps } from "@/types/tx"
import { decodeLog } from "@/lib/decode"
import { hexToNumber } from "@/lib/format"
import { AddressLink } from "@/components/Links"
import { ArgList, MethodBadge } from "@/components/ArgValue"
import { EmptyState } from "@/components/QueryState"

export function EventLogs({ logs }: { logs: LogProps[] }): JSX.Element {
  const t = useTranslations("tx")

  if (logs.length === 0) return <EmptyState>{t("noEvents")}</EmptyState>

  return (
    <ol className="flex flex-col divide-y">
      {logs.map((log) => {
        const decoded = decodeLog(log)
        return (
          <li key={log.logIndex} className="flex gap-3 py-4">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs tabular-nums text-muted-foreground">
              {hexToNumber(log.logIndex)}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {decoded ? <MethodBadge name={decoded.name} /> : <MethodBadge name={t("unknownEvent")} />}
                <AddressLink address={log.address} short />
              </div>
              {decoded ? (
                <ArgList args={decoded.args} />
              ) : (
                <div className="flex flex-col gap-1 font-mono text-xs break-all text-muted-foreground">
                  {log.topics.map((topic, i) => (
                    <span key={i}>
                      [{i}] {topic}
                    </span>
                  ))}
                  <span>data {log.data}</span>
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
