import { Ship } from './Ship'

export type OrderResponse = {
  credits: number
  order: Order
  ship: Ship
}

export type Order = {
  good: GoodType
  pricePerUnit: number
  quantity: number
  total: number
}

export type ListGoodTypesResponse = {
  goods: Good[]
}

export enum GoodType {
  FUEL = 'FUEL',
  CHEMICALS = 'CHEMICALS',
  METALS = 'METALS',
  DRONES = 'DRONES',
  FOOD = 'FOOD',
  NARCOTICS = 'NARCOTICS',
  EXPLOSIVES = 'EXPLOSIVES',
  TEXTILES = 'TEXTILES',
  SHIP_PLATING = 'SHIP_PLATING',
  MACHINERY = 'MACHINERY',
  CONSUMER_GOODS = 'CONSUMER_GOODS',
  RARE_METALS = 'RARE_METALS',
  ELECTRONICS = 'ELECTRONICS',
  SHIP_PARTS = 'SHIP_PARTS',
  PROTEIN_SYNTHESIZERS = 'PROTEIN_SYNTHESIZERS',
  CONSTRUCTION_MATERIALS = 'CONSTRUCTION_MATERIALS',
  BIOMETRIC_FIREARMS = 'BIOMETRIC_FIREARMS',
  PRECISION_INSTRUMENTS = 'PRECISION_INSTRUMENTS',
  UNSTABLE_COMPOUNDS = 'UNSTABLE_COMPOUNDS',
  EXOTIC_PLASMA = 'EXOTIC_PLASMA',
  FUSION_REACTORS = 'FUSION_REACTORS',
  NANOBOTS = 'NANOBOTS',
  RESEARCH = 'RESEARCH',
  ZUCO_CRYSTALS = 'ZUCO_CRYSTALS',
}

export type Good = {
  name: string
  symbol: GoodType
  volumePerUnit: number
}
