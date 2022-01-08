import { FlightPlanExternal } from './FlightPlan'
import { Location } from './Location'
import { Ship, ShipExternal } from './Ship'

export type SystemsResponse = {
  systems: System
}

export type System = {
  name: string
  symbol: string
}

export type ListSystemShipsResponse = {
  shipListings: ShipListing[]
}

export type ShipListing = Ship & {
  purchaseLocations: PurchaseLocation
}

export type PurchaseLocation = {
  location: string
  price: number
  system: string
}

export type ListSystemFlightPlansResponse = {
  flightPlans: FlightPlanExternal[]
}

export type ListSystemLocationsResponse = {
  locations: Location[]
}

export type SystemDockedShipsResponse = {
  ships: ShipExternal[]
}
