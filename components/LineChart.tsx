"use client"

import { JSX, useEffect, useMemo, useRef, useState } from "react"
import { useFormatter, useTranslations } from "next-intl"

export interface ChartPoint {
  x: number // unix seconds
  y: number
}

interface Props {
  points: ChartPoint[]
  formatValue: (value: number) => string
  height?: number
  zeroBased?: boolean
  label: string
}

const PAD = { top: 16, right: 16, bottom: 30, left: 68 }

function niceTicks(min: number, max: number, count = 4): number[] {
  if (min === max) return [min]
  const raw = (max - min) / count
  const mag = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw
  const start = Math.ceil(min / step) * step
  const ticks: number[] = []
  for (let v = start; v <= max + step * 1e-9; v += step) ticks.push(v)
  return ticks
}

/** Single-series line chart: 2px line, 10% area wash, hairline grid, crosshair tooltip. */
export function LineChart({ points, formatValue, height = 220, zeroBased, label }: Props): JSX.Element {
  const t = useTranslations("network")
  const format = useFormatter()
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(600)
  const [hover, setHover] = useState<number | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(240, entry.contentRect.width)))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const geometry = useMemo(() => {
    if (points.length < 2) return null
    const xs = points.map((p) => p.x)
    const ys = points.map((p) => p.y)
    const xMin = Math.min(...xs), xMax = Math.max(...xs)
    let yMin = zeroBased ? 0 : Math.min(...ys), yMax = Math.max(...ys)
    const pad = (yMax - yMin) * 0.1 || Math.abs(yMax) * 0.1 || 1
    yMax += pad
    // never pad below zero for non-negative data (avoids a "-0" tick)
    if (!zeroBased) yMin = Math.min(...ys) >= 0 ? Math.max(0, yMin - pad) : yMin - pad
    const yTicks = niceTicks(yMin, yMax)
    const innerW = width - PAD.left - PAD.right
    const innerH = height - PAD.top - PAD.bottom
    const sx = (x: number) => PAD.left + ((x - xMin) / (xMax - xMin || 1)) * innerW
    const sy = (y: number) => PAD.top + (1 - (y - yMin) / (yMax - yMin || 1)) * innerH
    const line = points.map((p, i) => `${i ? "L" : "M"}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join("")
    const area = `${line}L${sx(xMax).toFixed(1)},${sy(yMin).toFixed(1)}L${sx(xMin).toFixed(1)},${sy(yMin).toFixed(1)}Z`
    const xTicks = [0, 1 / 3, 2 / 3, 1].map((f) => xMin + f * (xMax - xMin))
    return { sx, sy, line, area, yTicks, xTicks, xMin, xMax, innerW, yMin }
  }, [points, width, height, zeroBased])

  const spanDays = points.length > 1 ? (points[points.length - 1].x - points[0].x) / 86400 : 0
  const xLabel = (x: number) =>
    format.dateTime(new Date(x * 1000), spanDays <= 2 ? { hour: "2-digit", minute: "2-digit" } : { day: "2-digit", month: "2-digit" })

  function onMove(e: React.PointerEvent<SVGRectElement>) {
    if (!geometry) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = geometry.xMin + ((e.clientX - rect.left) / rect.width) * (geometry.xMax - geometry.xMin)
    let best = 0
    for (let i = 1; i < points.length; i++) if (Math.abs(points[i].x - x) < Math.abs(points[best].x - x)) best = i
    setHover(best)
  }

  const last = points[points.length - 1]
  const active = hover !== null ? points[hover] : null

  return (
    <div ref={ref} className="relative w-full">
      {geometry ? (
        <svg width={width} height={height} role="img" aria-label={label} className="block overflow-visible">
          {geometry.yTicks.map((v) => (
            <g key={v}>
              <line x1={PAD.left} x2={width - PAD.right} y1={geometry.sy(v)} y2={geometry.sy(v)} className="stroke-chart-grid" strokeWidth={1} />
              <text x={PAD.left - 8} y={geometry.sy(v)} dy="0.32em" textAnchor="end" className="fill-chart-axis text-xs tabular-nums">
                {formatValue(v)}
              </text>
            </g>
          ))}
          {geometry.xTicks.map((x, i) => (
            <text
              key={i}
              x={geometry.sx(x)}
              y={height - 8}
              textAnchor={i === 0 ? "start" : i === 3 ? "end" : "middle"}
              className="fill-chart-axis text-xs"
            >
              {xLabel(x)}
            </text>
          ))}
          <path d={geometry.area} className="fill-chart" style={{ fillOpacity: "var(--chart-area-opacity)" }} />
          <path d={geometry.line} className="stroke-chart" fill="none" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {active && (
            <line
              x1={geometry.sx(active.x)}
              x2={geometry.sx(active.x)}
              y1={PAD.top}
              y2={height - PAD.bottom}
              className="stroke-chart-axis"
              strokeWidth={1}
              strokeOpacity={0.6}
            />
          )}
          {(active ?? last) && (
            <circle
              cx={geometry.sx((active ?? last).x)}
              cy={geometry.sy((active ?? last).y)}
              r={4}
              className="fill-chart stroke-card"
              strokeWidth={2}
            />
          )}
          <rect
            x={PAD.left}
            y={PAD.top}
            width={geometry.innerW}
            height={height - PAD.top - PAD.bottom}
            fill="transparent"
            onPointerMove={onMove}
            onPointerLeave={() => setHover(null)}
          />
        </svg>
      ) : (
        <div style={{ height }} />
      )}

      {active && geometry && (
        <div
          className="pointer-events-none absolute top-0 z-10 rounded-lg border border-tooltip-border bg-tooltip px-3 py-2 text-xs shadow-lg"
          style={{
            left: Math.min(Math.max(geometry.sx(active.x) - 80, 0), width - 170),
          }}
        >
          <p className="text-sm font-semibold tabular-nums">{formatValue(active.y)}</p>
          <p className="text-muted-foreground">
            {format.dateTime(new Date(active.x * 1000), { dateStyle: "short", timeStyle: "short" })}
          </p>
        </div>
      )}

      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">{t("viewTable")}</summary>
        <div className="mt-2 max-h-56 overflow-auto rounded-lg border">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-muted">
              <tr>
                <th className="px-3 py-1.5 font-medium">{t("colDate")}</th>
                <th className="px-3 py-1.5 text-right font-medium">{label}</th>
              </tr>
            </thead>
            <tbody>
              {[...points].reverse().map((p) => (
                <tr key={p.x} className="border-t">
                  <td className="px-3 py-1">{format.dateTime(new Date(p.x * 1000), { dateStyle: "short", timeStyle: "short" })}</td>
                  <td className="px-3 py-1 text-right tabular-nums">{formatValue(p.y)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}
