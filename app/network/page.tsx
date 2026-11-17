import { JSX } from "react"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { PageTitle, Screen } from "@/components/Screen"
import { NetworkOverview } from "./components/NetworkOverview"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("network")
  return { title: t("title") }
}

export default async function Network(): Promise<JSX.Element> {
  const t = await getTranslations("network")
  return (
    <Screen>
      <PageTitle title={t("title")} />
      <p className="-mt-2 mb-6 max-w-3xl text-muted-foreground">{t("intro")}</p>
      <NetworkOverview />
    </Screen>
  )
}
