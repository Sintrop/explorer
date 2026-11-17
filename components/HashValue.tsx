import { JSX } from "react"
import { CopyButton } from "./CopyButton"

/** Full hash in monospace that wraps on small screens, with a copy button. */
export function HashValue({ value }: { value: string }): JSX.Element {
  return (
    <span className="inline-flex max-w-full items-start gap-1">
      <span className="font-mono text-sm break-all">{value}</span>
      <CopyButton value={value} />
    </span>
  )
}
