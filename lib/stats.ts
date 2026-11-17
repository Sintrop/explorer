export function formatHashrate(hashesPerSecond: number, locale: string): string {
  const units = ["H/s", "kH/s", "MH/s", "GH/s", "TH/s", "PH/s"]
  let value = hashesPerSecond
  let unit = 0
  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000
    unit++
  }
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value)} ${units[unit]}`
}
