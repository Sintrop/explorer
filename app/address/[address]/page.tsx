import { JSX } from "react"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { getAddress, isAddress } from "ethers"
import { Screen } from "@/components/Screen"
import { IconAddress } from "@/components/IconAddress/IconAddress"
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
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <IconAddress address={address} size={56} />
        <p className="font-mono text-sm break-all sm:text-xl">{address}</p>
      </div>
      <AddressData address={address} />
    </Screen>
  )
}
