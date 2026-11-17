import { useTranslations } from "next-intl"
import { Screen } from "@/components/Screen"
import { Search } from "@/components/Search"
import { NetworkStats } from "./components/NetworkStats"
import { LatestBlocks } from "./components/LatestBlocks"
import { LatestTransactions } from "./components/LatestTransactions"
import { RecentMiners } from "./components/RecentMiners"
import { ProtocolActivity } from "./components/ProtocolActivity"
import { hasRegistry } from "@/config/contracts/registry"

function Hero() {
  const t = useTranslations("home")
  return (
    <div className="bg-hero text-hero-foreground">
      <div className="container mx-auto flex flex-col gap-5 px-4 py-10 sm:px-5 sm:py-14">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">{t("heroTitle")}</h1>
          <p className="mt-2 max-w-2xl text-hero-foreground/75">{t("heroSubtitle")}</p>
        </div>
        <Search />
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Screen showSearch={false} hero={<Hero />}>
      <div className="flex flex-col gap-6">
        <NetworkStats />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:items-start">
          <LatestBlocks />
          {hasRegistry ? <ProtocolActivity /> : <LatestTransactions />}
        </div>
        {hasRegistry && <LatestTransactions />}
        <RecentMiners />
      </div>
    </Screen>
  )
}
