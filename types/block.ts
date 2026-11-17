import { TxProps } from "./tx"

export interface BlockProps<T = string | TxProps> {
  difficulty: string
  extraData: string
  gasLimit: string
  gasUsed: string
  hash: string
  logsBloom: string
  miner: string
  mixHash: string
  nonce: string
  number: string
  parentHash: string
  receiptsRoot: string
  sha3Uncles: string
  stateRoot: string
  timestamp: string
  totalDifficulty: string
  transactionsRoot: string
  size: string
  transactions: T[]
  uncles: string[]
}
