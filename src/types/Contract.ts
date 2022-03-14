import { Meta } from './Meta'

export type ListContractsResponse = {
  data: Contract[]
  meta: Meta
}

export type ContractResponse = {
  data: Contract
}

export type Contract = {
  id: string
  faction: string
  type: string
  terms: ContractTerms
  accepted: boolean
  fulfilled: boolean
  expiresAt: string
}

export type ContractTerms = {
  deadline: string
  payment: {
    onAccepted: number
    onFulfilled: number
  }
  deliver?: DeliveryTerms
}

export type DeliveryTerms = {
  tradeSymbol: string
  destination: string
  units: number
  fulfilled: number
}
