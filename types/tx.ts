export interface TxProps {
  blockHash: string | null
  blockNumber: string | null
  chainId?: string
  from: string
  gas: string
  gasPrice: string
  hash: string
  input: string
  nonce: string
  r: string
  s: string
  to: string | null
  transactionIndex: string | null
  type: string
  v: string
  value: string
}

export interface LogProps {
  address: string
  topics: string[]
  data: string
  logIndex: string
}

export interface ReceiptTxProps {
  blockHash: string
  blockNumber: string
  contractAddress: string | null
  cumulativeGasUsed: string
  effectiveGasPrice?: string
  from: string
  gasUsed: string
  logs: LogProps[]
  logsBloom: string
  status: string
  to: string | null
  transactionHash: string
  transactionIndex: string
  type: string
}

export interface CallTraceProps {
  type: string
  from: string
  to?: string
  value?: string
  gas: string
  gasUsed: string
  input: string
  output?: string
  error?: string
  revertReason?: string
  calls?: CallTraceProps[]
}
