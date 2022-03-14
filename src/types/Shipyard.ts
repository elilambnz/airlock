import Module from 'module'
import { Meta } from './Meta'
import { Frame, Mount, Reactor, RegistrationRole, Ship } from './Ship'

export type ListShipyardsResponse = {
  data: Shipyard[]
  meta: Meta
}

export type ShipyardResponse = {
  data: Shipyard
}

export type ListShipyardListingsResponse = {
  data: ShipListing[]
  meta: Meta
}

export type Shipyard = {
  symbol: string
  faction: string
}

export type ShipListing = {
  id: string
  waypoint: string
  price: number
  role: RegistrationRole
  frame: Frame
  reactor: Reactor
  modules: Module[]
  mounts: Mount[]
}

export type PurchaseShipResponse = {
  data: {
    ship: Ship
    credits: number
  }
}
