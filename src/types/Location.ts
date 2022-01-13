import { Good } from './Order'
import { ShipExternal } from './Ship'
import { Structure } from './Structure'

export type LocationResponse = {
  location: Location
}

export type Location = {
  allowsConstruction: boolean
  dockedShips?: number
  messages?: string[]
  name: string
  symbol: string
  traits?: string[]
  type: string
  x: number
  y: number
}

export enum LocationType {
  PLANET = 'PLANET',
  MOON = 'MOON',
  ASTEROID = 'ASTEROID',
  GAS_GIANT = 'GAS_GIANT',
  WORMHOLE = 'WORMHOLE',
}

export type LocationMarketplaceResponse = {
  marketplace: LocationMarketplace[]
}

export type LocationMarketplace = {
  pricePerUnit: number
  purchasePricePerUnit: number
  quantityAvailable: number
  sellPricePerUnit: number
  spread: number
  symbol: Good
  volumePerUnit: number
}

export type LocationShipResponse = {
  ships: ShipExternal[]
}

export type LocationStructuresResponse = {
  structures: Structure[]
}
