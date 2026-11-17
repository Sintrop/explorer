import { JSX } from "react"
import Link from "next/link"
import { getAddress } from "ethers"
import { IconAddress } from "./IconAddress/IconAddress"
import { shortenHash } from "@/lib/format"
import { cn } from "@/lib/utils"

const linkClass = "text-blue-600 underline-offset-2 hover:underline"

function checksum(address: string): string {
  try {
    return getAddress(address)
  } catch {
    return address
  }
}

export function AddressLink({ address, short, className }: { address: string; short?: boolean; className?: string }): JSX.Element {
  const value = checksum(address)
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2", className)}>
      <span className="shrink-0">
        <IconAddress address={value} size={20} />
      </span>
      <Link href={`/address/${value}`} className={cn(linkClass, "font-mono text-sm break-all")} title={value}>
        {short ? shortenHash(value, 8, 6) : value}
      </Link>
    </span>
  )
}

export function BlockLink({ block, label }: { block: string | number | bigint; label?: string }): JSX.Element {
  return (
    <Link href={`/block/${block.toString()}`} className={linkClass}>
      {label ?? block.toString()}
    </Link>
  )
}

export function TxLink({ hash, short }: { hash: string; short?: boolean }): JSX.Element {
  return (
    <Link href={`/tx/${hash}`} className={cn(linkClass, "font-mono text-sm break-all")} title={hash}>
      {short ? shortenHash(hash) : hash}
    </Link>
  )
}
