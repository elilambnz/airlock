export type TradeRoute = {
  id: string
  events: TradeRouteEvent[]
  assignedShips: string[]
  autoRefuel: boolean
  status: TradeRouteStatus
  errorMessage?: string
}

export type TradeRouteEvent = {
  type: RouteEventType
  good?: RouteEventGood
  location?: string
}

export enum RouteEventType {
  BUY = 'Buy',
  SELL = 'Sell',
  TRAVEL = 'Travel',
}

export type RouteEventGood = {
  good: string
  quantity: number
}

export enum TradeRouteStatus {
  ACTIVE = 'Active',
  PAUSED = 'Paused',
  ERROR = 'Error',
}
