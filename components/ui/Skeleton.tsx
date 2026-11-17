import { JSX } from "react"
import { cn } from "@/lib/utils"

export function Skeleton({ className }: { className?: string }): JSX.Element {
  return <span aria-hidden className={cn("inline-block animate-pulse rounded-md bg-muted", className)} />
}

export function SkeletonRows({ rows = 6 }: { rows?: number }): JSX.Element {
  return (
    <div className="flex flex-col divide-y" role="status" aria-busy>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  )
}
