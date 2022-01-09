import { FlightPlanExternal } from './FlightPlan'
import { Location } from './Location'
import { ShipExternal, ShipListing } from './Ship'

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
