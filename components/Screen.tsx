import React, { JSX } from "react"
import { Header } from "./Header"
import { Footer } from "./Footer"

interface Props {
  children: React.ReactNode
  showSearch?: boolean
  hero?: React.ReactNode
}

export function Screen({ children, showSearch, hero }: Props): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col">
      <Header showSearch={showSearch} />
      {hero}
      <main className="container mx-auto w-full px-4 pt-6 pb-16 sm:px-5 sm:pt-8">{children}</main>
      <Footer />
    </div>
  )
}

export function PageTitle({ title, subtitle, actions }: { title: React.ReactNode; subtitle?: React.ReactNode; actions?: React.ReactNode }): JSX.Element {
  return (
    <div className="mb-6 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <div className="mt-1 text-muted-foreground">{subtitle}</div>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  )
}
