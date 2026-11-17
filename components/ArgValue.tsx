import { JSX } from "react"
import { useFormatter } from "next-intl"
import { ArgValue as Value, DecodedArg } from "@/lib/decode"
import { AddressLink } from "./Links"
import { Amount } from "./Amount"
import { TOKEN_DECIMALS, TOKEN_SYMBOL, tokenContract } from "@/config/contracts/registry"

// protocol amounts are RC with 18 decimals; show them formatted next to the raw integer
const AMOUNT_NAME = /amount|value|tokens|balance|total/i
const MIN_AMOUNT = BigInt(10) ** BigInt(12)

function isArgList(value: Value): value is DecodedArg[] {
  return Array.isArray(value) && value.length > 0 && typeof value[0] === "object" && value[0] !== null && "type" in (value[0] as object)
}

export function ArgValue({ value, type, name }: { value: Value; type: string; name?: string }): JSX.Element {
  const format = useFormatter()

  if (value === null) return <span className="text-muted-foreground">null</span>
  if (isArgList(value)) return <ArgList args={value} nested />
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-muted-foreground">[]</span>
    const child = type.replace(/\[\d*\]$/, "")
    return (
      <ol className="flex flex-col gap-1 border-l pl-3">
        {value.map((item, i) => (
          <li key={i}>
            <ArgValue value={item} type={child} />
          </li>
        ))}
      </ol>
    )
  }
  if (type === "address" && typeof value === "string") return <AddressLink address={value} short />
  if (typeof value === "bigint") {
    if (tokenContract && name && AMOUNT_NAME.test(name) && value >= MIN_AMOUNT) {
      return (
        <span className="flex flex-col">
          <span className="font-medium">
            <Amount value={value} decimals={TOKEN_DECIMALS} symbol={TOKEN_SYMBOL} maxFractionDigits={6} />
          </span>
          <span className="font-mono text-xs text-muted-foreground tabular-nums">{value.toString()}</span>
        </span>
      )
    }
    return <span className="tabular-nums">{format.number(value)}</span>
  }
  if (typeof value === "boolean") return <span>{value ? "true" : "false"}</span>
  return <span className="font-mono text-xs break-all">{String(value)}</span>
}

export function ArgList({ args, nested }: { args: DecodedArg[]; nested?: boolean }): JSX.Element {
  if (args.length === 0) return <span className="text-sm text-muted-foreground">()</span>
  return (
    <dl className={nested ? "flex flex-col gap-1.5 border-l pl-3" : "flex flex-col gap-1.5"}>
      {args.map((arg, i) => (
        <div key={i} className="flex flex-col gap-0.5 text-sm sm:flex-row sm:gap-3">
          <dt className="shrink-0 font-mono text-xs text-muted-foreground sm:w-44 sm:pt-0.5">
            {arg.name} <span className="opacity-70">{arg.type}</span>
          </dt>
          <dd className="min-w-0">
            <ArgValue value={arg.value} type={arg.type} name={arg.name} />
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function MethodBadge({ name }: { name: string }): JSX.Element {
  return <span className="inline-block rounded-md bg-accent px-2 py-0.5 font-mono text-xs font-medium text-accent-foreground">{name}</span>
}
