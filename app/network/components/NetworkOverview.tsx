"use client"

import { JSX, ReactNode, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useFormatter, useLocale, useTranslations } from "next-intl"
import { CircleCheck, CircleX, Minus } from "lucide-react"
import { network } from "@/config/network"
import { useLatestBlockNumber } from "@/hooks/useChain"
import { formatHashrate } from "@/lib/stats"
import { cn } from "@/lib/utils"
import { Card, CardBody, CardHeader } from "@/components/ui/Card"
import { Skeleton } from "@/components/ui/Skeleton"
import { AddressLink } from "@/components/Links"
import { LineChart } from "@/components/LineChart"
import { Loading, RpcErrorMessage } from "@/components/QueryState"
import type { NodeName, NodeStatus } from "@/lib/server/nodes"
import type { HistoryPoint, MinerShare } from "@/lib/server/history"

const RANGES = ["1d", "7d", "30d", "90d"] as const
type Range = (typeof RANGES)[number]

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(String(response.status))
  return response.json()
}

function Stat({ label, children, hint }: { label: string; children?: ReactNode; hint?: ReactNode }): JSX.Element {
  return (
    <div className="min-w-0 rounded-xl border bg-card p-4 shadow-sm">
      <p className="truncate text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-lg font-semibold tabular-nums">{children ?? <Skeleton className="h-5 w-24" />}</p>
      {hint && <p className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function StatusIcon({ ok, label }: { ok: boolean | null; label: string }): JSX.Element {
  if (ok === null) return <Minus className="size-4 text-muted-foreground" aria-label={label} />
  return ok ? (
    <CircleCheck className="size-4 text-success" aria-label={label} />
  ) : (
    <CircleX className="size-4 text-danger" aria-label={label} />
  )
}

function nodeName(name: NodeName, locale: string): string {
  return typeof name === "string" ? name : (name[locale] ?? Object.values(name)[0] ?? "")
}

function NodesCard(): JSX.Element {
  const t = useTranslations("network")
  const locale = useLocale()
  const format = useFormatter()
  const { data: latest } = useLatestBlockNumber()
  const nodes = useQuery({
    queryKey: ["networkNodes"],
    queryFn: () => getJson<{ nodes: NodeStatus[] }>("/api/network/nodes"),
    refetchInterval: 30000,
  })

  return (
    <Card>
      <CardHeader title={t("nodes")} action={t("nodesHint")} />
      {nodes.isLoading ? (
        <Loading rows={4} />
      ) : nodes.isError ? (
        <RpcErrorMessage onRetry={() => nodes.refetch()} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground">
              <tr className="border-b">
                <th className="px-5 py-2 font-medium">{t("colNode")}</th>
                <th className="px-3 py-2 font-medium">{t("colP2p")}</th>
                <th className="px-3 py-2 font-medium">{t("colRpc")}</th>
                <th className="px-3 py-2 font-medium">{t("colClient")}</th>
                <th className="px-3 py-2 text-right font-medium">{t("colHeight")}</th>
                <th className="px-3 py-2 text-right font-medium">{t("colPeers")}</th>
                <th className="px-5 py-2 text-right font-medium">{t("colLatency")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {nodes.data!.nodes.map((node, index) => {
                const lag = node.block !== null && latest !== undefined ? latest - node.block : null
                return (
                  <tr key={index}>
                    <td className="px-5 py-3">
                      <p className="font-medium">{nodeName(node.name, locale)}</p>
                      {node.host && (
                        <p className="font-mono text-xs text-muted-foreground">
                          {node.host}:{node.p2pPort}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <StatusIcon ok={node.p2pReachable} label={t("colP2p")} />
                        <span className="text-xs text-muted-foreground">
                          {node.p2pReachable === null ? "—" : node.p2pReachable ? t("reachable") : t("unreachable")}
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <StatusIcon ok={node.rpcOnline} label={t("colRpc")} />
                        <span className="text-xs text-muted-foreground">
                          {!node.hasRpc ? t("rpcClosed") : node.rpcOnline ? t("online") : t("offline")}
                        </span>
                      </span>
                    </td>
                    <td className="max-w-[16rem] truncate px-3 py-3 font-mono text-xs" title={node.client ?? ""}>
                      {node.client ? node.client.split("/").slice(0, 3).join("/") : "—"}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {node.block !== null ? format.number(node.block) : "—"}
                      {lag !== null && lag > 2 && <span className="ml-1 text-xs text-warning">−{lag}</span>}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{node.peers ?? "—"}</td>
                    <td className="px-5 py-3 text-right text-muted-foreground tabular-nums">
                      {node.latencyMs !== null ? `${node.latencyMs} ms` : "—"}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

function MinersCard(): JSX.Element {
  const t = useTranslations("network")
  const format = useFormatter()
  const miners = useQuery({
    queryKey: ["networkMiners"],
    queryFn: () => getJson<{ miners: MinerShare[]; sample: number; span: number }>("/api/network/miners"),
    staleTime: 300000,
  })

  return (
    <Card>
      <CardHeader title={t("miners24h")} action={miners.data ? t("minersHint", { sample: miners.data.sample }) : undefined} />
      {miners.isLoading ? (
        <Loading rows={2} />
      ) : miners.isError ? (
        <RpcErrorMessage onRetry={() => miners.refetch()} />
      ) : (
        <CardBody className="py-4">
          <ul className="flex flex-col gap-3">
            {miners.data!.miners.map((m) => (
              <li key={m.miner} className="flex flex-col gap-1.5 text-sm sm:flex-row sm:items-center sm:gap-4">
                <AddressLink address={m.miner} className="sm:w-[26rem] sm:shrink-0" />
                <div className="flex flex-1 items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-chart" style={{ width: `${m.share * 100}%` }} />
                  </div>
                  <span className="w-40 shrink-0 text-right text-muted-foreground tabular-nums">
                    {format.number(m.share, { style: "percent", maximumFractionDigits: 1 })} · {t("approxBlocks", { count: m.blocks })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </CardBody>
      )}
    </Card>
  )
}

function ForkCard({ latest, avgBlockTime }: { latest?: number; avgBlockTime?: number }): JSX.Element | null {
  const t = useTranslations("network")
  const format = useFormatter()
  const fork = network.upcomingFork
  if (!fork || (latest !== undefined && latest >= fork.block)) return null

  const remaining = latest !== undefined ? fork.block - latest : undefined
  const eta = remaining !== undefined && avgBlockTime ? new Date(Date.now() + remaining * avgBlockTime * 1000) : undefined
  const progress = latest !== undefined ? latest / fork.block : 0

  return (
    <Card>
      <CardHeader title={t("forkTitle")} />
      <CardBody className="flex flex-col gap-4 py-4">
        <p className="text-sm text-muted-foreground">
          {fork.nextReward !== undefined && network.blockReward !== undefined
            ? t("forkReward", {
                block: format.number(fork.block),
                before: format.number(network.blockReward),
                after: format.number(fork.nextReward),
                coin: network.coinName,
              })
            : t("forkGeneric", { block: format.number(fork.block) })}
          {fork.eraBlocks ? ` ${t("forkEras", { era: format.number(fork.eraBlocks) })}` : ""}
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat label={t("forkBlock")}>{format.number(fork.block)}</Stat>
          <Stat label={t("forkRemaining")}>{remaining !== undefined ? format.number(remaining) : undefined}</Stat>
          <Stat label={t("forkEta")} hint={t("forkEtaHint")}>
            {eta ? format.dateTime(eta, { dateStyle: "medium" }) : undefined}
          </Stat>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={Math.round(progress * 100)}>
          <div className="h-full rounded-full bg-chart" style={{ width: `${progress * 100}%` }} />
        </div>
      </CardBody>
    </Card>
  )
}

export function NetworkOverview(): JSX.Element {
  const t = useTranslations("network")
  const format = useFormatter()
  const locale = useLocale()
  const [range, setRange] = useState<Range>("7d")
  const { data: latest } = useLatestBlockNumber()

  const history = useQuery({
    queryKey: ["networkHistory", range],
    queryFn: () => getJson<{ points: HistoryPoint[] }>(`/api/network/history?range=${range}`),
    staleTime: 300000,
    placeholderData: (previous) => previous,
  })

  const points = history.data?.points ?? []
  const withTime = points.filter((p) => p.blockTime !== null && p.blockTime > 0)
  const first = points[0]
  const last = points[points.length - 1]
  const avgBlockTime = first && last && last.block > first.block ? (last.timestamp - first.timestamp) / (last.block - first.block) : undefined
  const currentDifficulty = last ? Number(last.difficulty) : undefined

  const difficultySeries = points.map((p) => ({ x: p.timestamp, y: Number(p.difficulty) }))
  const blockTimeSeries = withTime.map((p) => ({ x: p.timestamp, y: p.blockTime! }))
  const hashrateSeries = withTime.map((p) => ({ x: p.timestamp, y: Number(p.difficulty) / p.blockTime! }))

  const compact = (v: number) => format.number(v, { notation: "compact", maximumFractionDigits: 1 })
  const seconds = (v: number) => t("secondsValue", { value: format.number(v, { maximumFractionDigits: 1 }) })
  const charts: { key: string; title: string; data: { x: number; y: number }[]; formatValue: (v: number) => string; zeroBased?: boolean }[] = [
    { key: "hashrate", title: t("hashrate"), data: hashrateSeries, formatValue: (v) => formatHashrate(v, locale) },
    { key: "difficulty", title: t("difficulty"), data: difficultySeries, formatValue: compact },
    { key: "blockTime", title: t("blockTime"), data: blockTimeSeries, formatValue: seconds, zeroBased: true },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t("range")}>
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            aria-pressed={range === r}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm hover:cursor-pointer",
              range === r ? "border-transparent bg-primary text-primary-foreground" : "bg-card hover:bg-muted",
            )}
          >
            {t(`ranges.${r}`)}
          </button>
        ))}
        {history.isFetching && <span className="text-xs text-muted-foreground">{t("updating")}</span>}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <Stat label={t("height")}>{latest !== undefined ? format.number(latest) : undefined}</Stat>
        <Stat label={t("avgBlockTime")} hint={t(`ranges.${range}`)}>
          {avgBlockTime ? seconds(avgBlockTime) : undefined}
        </Stat>
        <Stat label={t("hashrateAvg")} hint={t(`ranges.${range}`)}>
          {avgBlockTime && currentDifficulty ? formatHashrate(currentDifficulty / avgBlockTime, locale) : undefined}
        </Stat>
        <Stat label={t("difficultyNow")}>{currentDifficulty ? format.number(currentDifficulty) : undefined}</Stat>
        <Stat label={t("blockReward")}>
          {network.blockReward !== undefined ? `${format.number(network.blockReward)} ${network.coinName}` : "—"}
        </Stat>
        <Stat label={t("chainId")}>{network.chainId}</Stat>
      </div>

      <ForkCard latest={latest} avgBlockTime={avgBlockTime} />

      <NodesCard />

      {history.isError && !history.data ? (
        <Card>
          <RpcErrorMessage onRetry={() => history.refetch()} />
        </Card>
      ) : (
        <div className={cn("grid grid-cols-1 gap-6 xl:grid-cols-3", history.isFetching && history.data && "opacity-60 transition-opacity")}>
          {charts.map((chart) => (
            <Card key={chart.key}>
              <CardHeader title={chart.title} />
              <CardBody className="py-4">
                {history.data ? (
                  <LineChart points={chart.data} formatValue={chart.formatValue} label={chart.title} zeroBased={chart.zeroBased} />
                ) : (
                  <Skeleton className="h-[220px] w-full" />
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <MinersCard />
    </div>
  )
}
