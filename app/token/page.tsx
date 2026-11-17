import { JSX } from "react"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { PageTitle, Screen } from "@/components/Screen"
import { AddressLink } from "@/components/Links"
import { tokenContract } from "@/config/contracts/registry"
import { TokenOverview } from "./components/TokenOverview"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("token")
  return { title: t("metaTitle") }
}

export default async function Token(): Promise<JSX.Element> {
  if (!tokenContract) notFound()
  const t = await getTranslations("token")

  return (
    <Screen>
      <PageTitle title={t("title")} subtitle={<AddressLink address={tokenContract.address} copy />} />
      <p className="-mt-2 mb-6 max-w-3xl text-muted-foreground">{t("intro")}</p>
      <TokenOverview />
    </Screen>
  )
}
