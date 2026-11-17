import { JSX } from "react"
import Link from "next/link"
import { network } from "@/config/network"
import { TestnetTag } from "./TestnetTag"
import { Search } from "./Search"
import { LanguageSwitcher } from "./LanguageSwitcher"

export function Header({ showSearch = true }: { showSearch?: boolean }): JSX.Element {
  return (
    <header className="w-full border-b py-3">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 sm:px-5">
        <Link href="/" className="flex items-center gap-3">
          {network.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- external logo set by env, no need for the image optimizer
            <img width={48} height={48} alt="" src={network.logoUrl} className="size-12" />
          )}
          <span className="text-xl font-bold">{network.explorerTitle}</span>
        </Link>

        <div className="flex items-center gap-4 sm:order-last">
          {network.isTestnet && <TestnetTag />}
          <LanguageSwitcher />
        </div>

        {showSearch && (
          <div className="w-full md:w-auto md:flex-1 md:flex md:justify-end">
            <Search variant="compact" />
          </div>
        )}
      </div>
    </header>
  )
}
