import { Loan } from './Loan'
import { Ship } from './Ship'

export type GenerateTokenResponse = {
  token: string
  user: ClaimedUser
}

type ClaimedUser = {
  username: string
  credits: number
  ships: Ship[]
  loans: Loan[]
}
