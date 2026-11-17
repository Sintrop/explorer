import { JSX, ReactNode } from "react"
import { cn } from "@/lib/utils"

export function Card({ children, className }: { children: ReactNode; className?: string }): JSX.Element {
  return <section className={cn("min-w-0 rounded-xl border bg-card shadow-sm", className)}>{children}</section>
}

export function CardHeader({ title, action, className }: { title: ReactNode; action?: ReactNode; className?: string }): JSX.Element {
  return (
    <header className={cn("flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-5", className)}>
      <h2 className="font-semibold">{title}</h2>
      {action && <div className="text-sm text-muted-foreground">{action}</div>}
    </header>
  )
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }): JSX.Element {
  return <div className={cn("px-4 py-2 sm:px-5", className)}>{children}</div>
}
