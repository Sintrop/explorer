import { JSX } from "react"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { getAddress, isAddress } from "ethers"
import { Screen } from "@/components/Screen"
import { IconAddress } from "@/components/IconAddress/IconAddress"
import { CopyButton } from "@/components/CopyButton"
import { shortenHash } from "@/lib/format"
import { AddressData } from "./components/AddressData"

type Params = { params: Promise<{ address: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { address } = await params
  const t = await getTranslations("address")
  return { title: t("metaTitle", { address: shortenHash(address, 8, 6) }) }
}

export default async function Address({ params }: Params): Promise<JSX.Element> {
  const { address: raw } = await params
  // accept lowercase and mixed case; reject a mixed-case value with a wrong checksum
  if (!isAddress(raw)) notFound()

  const address = getAddress(raw)
  const t = await getTranslations("address")

  return (
    <Screen>
      <div className="mb-6 flex items-center gap-4">
        <span className="flex shrink-0">
          <IconAddress address={address} size={52} />
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("title")}</h1>
          <p className="mt-1 flex items-start gap-1">
            <span className="font-mono text-sm break-all text-muted-foreground sm:text-base">{address}</span>
            <CopyButton value={address} />
          </p>
        </div>
      </div>
      <AddressData address={address} />
    </Screen>
  )
}
