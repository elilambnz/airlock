type RawTradeRoute = {
  _version: number
  id: string
  events: string
  assignedShips: string[]
  autoRefuel: boolean
}

export type TradingRoutesResponse = RawTradeRoute[]

export type CreateTradingRoutesResponse = RawTradeRoute

export type RemoveTradingRoutesResponse = {
  id: string
}
