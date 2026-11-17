"use client"

import { JSX } from "react"
import { useFormatter, useNow } from "next-intl"

export function Timestamp({ seconds }: { seconds: number }): JSX.Element {
  const format = useFormatter()
  const now = useNow({ updateInterval: 1000 })
  const date = new Date(seconds * 1000)

  return (
    <span>
      {format.relativeTime(date, now)}
      <span className="text-gray-500">
        {" · "}
        {format.dateTime(date, {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZoneName: "short",
        })}
      </span>
    </span>
  )
}
