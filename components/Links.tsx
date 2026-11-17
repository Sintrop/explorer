import { JSX } from "react"
import Link from "next/link"
import { getAddress } from "ethers"
import { IconAddress } from "./IconAddress/IconAddress"
import { CopyButton } from "./CopyButton"
import { shortenHash } from "@/lib/format"
import { cn } from "@/lib/utils"

export const linkClass = "text-link underline-offset-2 hover:underline"

export function checksum(address: string): string {
  try {
    return getAddress(address)
  } catch {
    return address
  }
}

interface AddressLinkProps {
  address: string
  short?: boolean
  copy?: boolean
  className?: string
}

export function AddressLink({ address, short, copy, className }: AddressLinkProps): JSX.Element {
  const value = checksum(address)
  return (
    <span className={cn("inline-flex min-w-0 max-w-full items-center gap-2", className)}>
      <span className="flex shrink-0">
        <IconAddress address={value} size={18} />
      </span>
      <Link href={`/address/${value}`} className={cn(linkClass, "font-mono text-sm", short ? "whitespace-nowrap" : "break-all")} title={value}>
        {short ? shortenHash(value, 6, 4) : value}
      </Link>
      {copy && <CopyButton value={value} />}
    </span>
  )
}

export function BlockLink({ block, label }: { block: string | number | bigint; label?: string }): JSX.Element {
  return (
    <Link href={`/block/${block.toString()}`} className={cn(linkClass, "tabular-nums")}>
      {label ?? block.toString()}
    </Link>
  )
}

export function TxLink({ hash, short, copy }: { hash: string; short?: boolean; copy?: boolean }): JSX.Element {
  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-1">
      <Link href={`/tx/${hash}`} className={cn(linkClass, "font-mono text-sm", short ? "whitespace-nowrap" : "break-all")} title={hash}>
        {short ? shortenHash(hash, 8, 6) : hash}
      </Link>
      {copy && <CopyButton value={hash} />}
    </span>
  )
}
