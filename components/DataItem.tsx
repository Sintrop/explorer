import { JSX, ReactNode } from "react"

interface Props {
  label: string
  children: ReactNode
}

export function DataItem({ label, children }: Props): JSX.Element {
  return (
    <div className="flex flex-col gap-1 py-2 sm:flex-row sm:gap-4">
      <dt className="shrink-0 text-gray-500 sm:w-48">{label}</dt>
      <dd className="min-w-0 break-all">{children}</dd>
    </div>
  )
}

export function DataList({ children }: { children: ReactNode }): JSX.Element {
  return <dl className="mt-6 flex flex-col divide-y">{children}</dl>
}
