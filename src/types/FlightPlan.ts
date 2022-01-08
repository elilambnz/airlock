export type FlightPlanResponse = {
  flightPlan: FlightPlan
}

export type FlightPlan = {
  arrivesAt: string
  createdAt: string
  departure: string
  destination: string
  distance: number
  fuelConsumed: number
  fuelRemaining: number
  id: string
  shipId: string
  terminatedAt: string | null
  timeRemainingInSeconds: number
}

export type FlightPlanExternal = {
  arrivesAt: string
  createdAt: string
  departure: string
  destination: string
  id: string
  shipId: string
  shipType: string
  username: string
}
