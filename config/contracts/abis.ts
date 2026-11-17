import { Interface, InterfaceAbi } from "ethers"
import { contractSet } from "./registry"
import sintropMainnet from "./sintrop-mainnet.json"

interface ContractAbi {
  name: string
  address: string
  abi: InterfaceAbi
}

const sets: Record<string, ContractAbi[]> = {
  "sintrop-mainnet": sintropMainnet as ContractAbi[],
}

const contracts = sets[contractSet] ?? []
const interfaces = new Map(contracts.map((c) => [c.address.toLowerCase(), { name: c.name, iface: new Interface(c.abi) }]))

export function getContractInterface(address?: string | null): { name: string; iface: Interface } | undefined {
  return address ? interfaces.get(address.toLowerCase()) : undefined
}

export function getInterfaceByName(name: string): Interface | undefined {
  return [...interfaces.values()].find((c) => c.name === name)?.iface
}

/** All known custom errors (deduplicated), to decode reverts that bubble up from inner calls. */
export const allErrorsInterface = (() => {
  const seen = new Set<string>()
  const errors: string[] = []
  for (const { iface } of interfaces.values()) {
    iface.forEachError((error) => {
      const signature = error.format("full")
      if (!seen.has(error.selector)) {
        seen.add(error.selector)
        errors.push(signature)
      }
    })
  }
  return new Interface(errors)
})()
