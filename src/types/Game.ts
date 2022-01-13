export type StatusResponse = {
  status: string
}

export type LeaderboardNetWorthResponse = {
  netWorth: NetWorth[]
  userNetWorth?: NetWorth
}

export type NetWorth = {
  netWorth: number
  rank: number
  username: string
}
