export type AccountResponse = {
  user: User
}

export type User = {
  credits: number
  joinedAt: string
  shipCount: number
  structureCount: number
  username: string
}
