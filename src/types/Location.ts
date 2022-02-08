import { GoodType } from './Order'
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
  type: LocationType
  x: number
  y: number
}

export enum LocationType {
  PLANET = 'Planet',
  MOON = 'Moon',
  ASTEROID = 'Asteroid',
  GAS_GIANT = 'Gas Giant',
  WORMHOLE = 'Wormhole',
  NEBULA = 'Nebula',
}

export enum LocationTrait {
  HELIUM_3 = 'Helium-3',
  SOME_HELIUM_3 = 'Some Helium-3',
  ABUNDANT_HELIUM_3 = 'Abundant Helium-3',
  SOME_TECHNOLOGICAL_RUINS = 'Some Technological Ruins',
  TECHNOLOGICAL_RUINS = 'Technological Ruins',
  ABUNDANT_TECHNOLOGICAL_RUINS = 'Abundant Technological Ruins',
  NATURAL_CHEMICALS = 'Natural Chemicals',
  SOME_NATURAL_CHEMICALS = 'Some Natural Chemicals',
  ABUNDANT_NATURAL_CHEMICALS = 'Abundant Natural Chemicals',
  METAL_ORES = 'Metal Ores',
  SOME_METAL_ORES = 'Some Metal Ores',
  ABUNDANT_METAL_ORES = 'Abundant Metal Ores',
  RARE_METAL_ORES = 'Rare Metal Ores',
  SOME_RARE_METAL_ORES = 'Some Rare Metal Ores',
  ABUNDANT_RARE_METAL_ORES = 'Abundant Rare Metal Ores',
  ARABLE_LAND = 'Arable Land',
  SOME_ARABLE_LAND = 'Some Arable Land',
  ABUNDANT_ARABLE_LAND = 'Abundant Arable Land',
}

export type LocationMarketplaceResponse = {
  marketplace: MarketplaceGood[]
}

export type MarketplaceGood = {
  pricePerUnit: number
  purchasePricePerUnit: number
  quantityAvailable: number
  sellPricePerUnit: number
  spread: number
  symbol: GoodType
  volumePerUnit: number
}

export type LocationShipResponse = {
  ships: ShipExternal[]
}

export type LocationStructuresResponse = {
  structures: Structure[]
}

export enum System {
  'OE',
  'XV',
  'ZY1',
  'NA7',
}

export const getIconForLocationType = (type: LocationType) => {
  switch (type) {
    case LocationType.PLANET:
      return '🪐'
    case LocationType.MOON:
      return '🌑'
    case LocationType.ASTEROID:
      return '☄️'
    case LocationType.GAS_GIANT:
      return '💨'
    case LocationType.WORMHOLE:
      return '🕳️'
    case LocationType.NEBULA:
      return '🌌'
    default:
      return '🪐'
  }
}
