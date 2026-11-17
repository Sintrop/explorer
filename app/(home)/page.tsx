import { Screen } from "@/components/Screen"
import { Search } from "@/components/Search"
import { LatestBlock } from "./components/LatestBlock"
import { TxsInTheLatestBlock } from "./components/TxsInTheLatestBlock"
import { NetworkData } from "./components/NetworkData"

export default function Home() {
  return (
    <Screen showSearch={false}>
      <Search />

      <div className="flex w-full flex-col gap-10 lg:flex-row">
        <LatestBlock />
        <TxsInTheLatestBlock />
        <NetworkData />
      </div>
    </Screen>
  )
}
