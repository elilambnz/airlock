import { GoodType } from './Order'
import { PurchaseLocation } from './System'

export type ListShipTypesResponse = {
  ships: Ship[]
}

export type ListShipsResponse = {
  ships: Ship[]
}

export type ShipResponse = {
  ship: Ship
}

export type ListShipListingsResponse = {
  shipListings: ShipListing[]
}

export type Ship = {
  cargo: ShipCargo[]
  class: string
  flightPlanId?: string
  id: string
  location?: string
  loadingSpeed: number
  manufacturer: string
  maxCargo: number
  plating: number
  restrictedGoods?: GoodType[]
  spaceAvailable: number
  speed: number
  type: string
  weapons: number
  x?: number
  y?: number
}

export type ShipCargo = {
  good: GoodType
  quantity: number
  totalVolume: number
}

export type ShipListing = Ship & {
  purchaseLocations: PurchaseLocation[]
}

export type BuyShipResponse = {
  credits: number
  ship: Ship
}

export type ShipJettisonCargoResponse = {
  good: GoodType
  quantityRemaining: number
  shipId: string
}

export type ScrapShipResponse = {
  status: string
}

export type TransferShipCargoResponse = {
  fromShip: Ship
  toShip: Ship
}

export type ShipExternal = {
  shipId: string
  shipType: string
  username: string
}
