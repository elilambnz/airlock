import { Loan } from './Loan'
import { Ship } from './Ship'

export type User = {
  username: string
  credits: number
  ships: Ship[]
  loans: Loan[]
}

export type GenerateTokenResponse = {
  token: string
  user: User
}
