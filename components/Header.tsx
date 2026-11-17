import { JSX } from "react"
import Link from "next/link"
import { network } from "@/config/network"
import { TestnetTag } from "./TestnetTag"
import { Search } from "./Search"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { ThemeToggle } from "./ThemeToggle"
import { LiveBlock } from "./LiveBlock"
import { MainNav } from "./MainNav"

export function Header({ showSearch = true }: { showSearch?: boolean }): JSX.Element {
  return (
    <header className="z-20 w-full border-b bg-background/85 backdrop-blur md:sticky md:top-0">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-5">
        <Link href="/" className="flex items-center gap-2.5">
          {network.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- external logo set by env, no need for the image optimizer
            <img width={36} height={36} alt="" src={network.logoUrl} className="size-9" />
          )}
          <span className="text-lg font-bold tracking-tight">{network.explorerTitle}</span>
          {network.isTestnet && <TestnetTag />}
        </Link>

        <div className="flex items-center gap-1 sm:order-last">
          <MainNav />
          <LiveBlock />
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        {showSearch && (
          <div className="w-full md:flex md:w-auto md:flex-1 md:justify-end">
            <Search variant="compact" />
          </div>
        )}
      </div>
    </header>
  )
}
