export type ChartWaypointResponse = {}

export type DockShipResponse = {}

export type OrbitShipResponse = {}

export type JumpShipResponse = {}

export type JumpCooldownResponse = {}

export type RefuelShipResponse = {}

export type ShipNavigationResponse = {
  data: {
    fuelCost: number
    navigation: ShipNavigation
  }
}

export type ShipNavigationStatusResponse = {
  data: {
    navigation: ShipNavigation
  }
}

export type ShipNavigation = {
  shipSymbol: string
  departure: string
  destination: string
  durationRemaining: number
  arrivedAt?: string
}
