import { JSX } from "react"
import Link from "next/link"
import { getAddress } from "ethers"
import { IconAddress } from "./IconAddress/IconAddress"
import { CopyButton } from "./CopyButton"
import { shortenHash } from "@/lib/format"
import { getContractLabel } from "@/config/contracts/registry"
import { FileCode2 } from "lucide-react"
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
  const label = getContractLabel(value)

  return (
    <span className={cn("inline-flex min-w-0 max-w-full items-center gap-2", className)}>
      <span className="flex shrink-0">
        {label ? (
          <span className="flex size-[18px] items-center justify-center rounded-full bg-accent text-accent-foreground">
            <FileCode2 className="size-3" aria-hidden />
          </span>
        ) : (
          <IconAddress address={value} size={18} />
        )}
      </span>
      <Link href={`/address/${value}`} className={cn(linkClass, "min-w-0", !label && "font-mono text-sm", short ? "whitespace-nowrap" : "break-all")} title={value}>
        {label ? (
          <>
            <span className="font-medium">{label.name}</span>
            {!short && <span className="ml-2 font-mono text-sm text-muted-foreground">{value}</span>}
          </>
        ) : short ? (
          shortenHash(value, 6, 4)
        ) : (
          value
        )}
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

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

/** Transfer counterpart: the zero address becomes a "burned"/"mint" pill. */
export function TransferParty({ address, kind, label }: { address: string; kind: "from" | "to"; label: { burn: string; mint: string } }): JSX.Element {
  if (address.toLowerCase() === ZERO_ADDRESS) {
    return (
      <span className="rounded-full bg-danger-soft px-2 py-0.5 text-xs font-medium text-danger" title={ZERO_ADDRESS}>
        {kind === "to" ? label.burn : label.mint}
      </span>
    )
  }
  return <AddressLink address={address} short />
}
