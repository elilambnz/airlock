export type TradeRoute = {
  _version: number
  _deleted: boolean | null
  id: string
  events: TradeRouteEvent[]
  assignedShips: string[]
  autoRefuel: boolean
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
  REPEAT = 'Repeat',
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
