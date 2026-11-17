import sintropMainnetLabels from "./sintrop-mainnet.labels.json"

export interface ContractLabel {
  name: string
  address: string
}

const sets: Record<string, ContractLabel[]> = {
  "sintrop-mainnet": sintropMainnetLabels,
}

export const contractSet = process.env.NEXT_PUBLIC_CONTRACTS ?? ""
export const contractLabels: ContractLabel[] = sets[contractSet] ?? []

const byAddress = new Map(contractLabels.map((c) => [c.address.toLowerCase(), c]))

export function getContractLabel(address?: string | null): ContractLabel | undefined {
  return address ? byAddress.get(address.toLowerCase()) : undefined
}

export function getContractByName(name: string): ContractLabel | undefined {
  return contractLabels.find((c) => c.name === name)
}

/** The protocol's ERC-20 token, when the registry has one. */
export const tokenContract = getContractByName("RegenerationCredit")
export const TOKEN_SYMBOL = "RC"
export const TOKEN_DECIMALS = 18

export const hasRegistry = contractLabels.length > 0
