export type TradeRoute = {
  events: TradeRouteEvent[]
  assignedShips: string[]
  paused: boolean
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
