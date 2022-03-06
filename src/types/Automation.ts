export type TradeRoute = {
  _version: number
  id: string
  events: TradeRouteEvent[]
  assignedShips: string[]
  autoRefuel: boolean
  status: TradeRouteStatus
  errorMessage?: string
  startFromStep?: number
}

export type TradeRouteEvent = {
  type: RouteEventType
  good?: RouteEventGood
  location?: string
  structure?: RouteEventStructure
}

export enum RouteEventType {
  BUY = 'Buy',
  SELL = 'Sell',
  TRAVEL = 'Travel',
  WARP_JUMP = 'Warp Jump',
  WITHDRAW = 'Withdraw',
  DEPOSIT = 'Deposit',
}

export type RouteEventGood = {
  good: string
  quantity: number
}

export type RouteEventStructure = {
  structure: string
  category: string
  good: string
  quantity: number
}

export enum TradeRouteStatus {
  ACTIVE = 'Active',
  PAUSED = 'Paused',
  ERROR = 'Error',
}
