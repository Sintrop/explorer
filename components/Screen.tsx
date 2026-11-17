import React, { JSX } from "react"
import { Header } from "./Header"

interface Props {
  children: React.ReactNode
  showSearch?: boolean
}

export function Screen({ children, showSearch }: Props): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col">
      <Header showSearch={showSearch} />
      <main className="container mx-auto w-full px-4 pt-8 pb-20 sm:px-5">{children}</main>
    </div>
  )
}
