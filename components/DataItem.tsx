import { JSX, ReactNode } from "react"

export function DataItem({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:gap-4">
      <dt className="shrink-0 text-sm text-muted-foreground sm:w-52 sm:pt-0.5">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  )
}

export function DataList({ children }: { children: ReactNode }): JSX.Element {
  return <dl className="flex flex-col divide-y">{children}</dl>
}
