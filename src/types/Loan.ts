export type ListLoanTypesResponse = {
  loans: LoanType[]
}

export type LoanType = {
  amount: number
  collateralRequired: boolean
  rate: number
  termInDays: number
  type: LoanTier
}

export type ListLoansResponse = {
  loans: Loan[]
}

export type Loan = {
  due: string
  id: string
  repaymentAmount: number
  status: LoanStatus
  type: LoanTier
}

export type PayOffLoanResponse = {
  credits: number
  loans: Loan[]
}

export type CreateLoanResponse = {
  credits: number
  loan: Loan
}

export enum LoanStatus {
  CURRENT = 'CURRENT',
}

export enum LoanTier {
  STARTUP = 'STARTUP',
}
