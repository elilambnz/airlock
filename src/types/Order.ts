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
  FUEL = 'Fuel',
  CHEMICALS = 'Chemicals',
  METALS = 'Metals',
  DRONES = 'Drones',
  FOOD = 'Food',
  NARCOTICS = 'Narcotics',
  EXPLOSIVES = 'Explosives',
  TEXTILES = 'Textiles',
  SHIP_PLATING = 'Ship Plating',
  MACHINERY = 'Machinery',
  CONSUMER_GOODS = 'Consumer Goods',
  RARE_METALS = 'Rare Metals',
  ELECTRONICS = 'Electronics',
  SHIP_PARTS = 'Ship Parts',
  PROTEIN_SYNTHESIZERS = 'Protein Synthesizers',
  CONSTRUCTION_MATERIALS = 'Construction Materials',
  BIOMETRIC_FIREARMS = 'Biometric Firearms',
  PRECISION_INSTRUMENTS = 'Precision Instruments',
  UNSTABLE_COMPOUNDS = 'Unstable Compounds',
  EXOTIC_PLASMA = 'Exotic Plasma',
  FUSION_REACTORS = 'Fusion Reactors',
  NANOBOTS = 'Nanobots',
  RESEARCH = 'Research',
  ZUCO_CRYSTALS = 'Zuco Crystals',
}

export type Good = {
  name: string
  symbol: GoodType
  volumePerUnit: number
}
