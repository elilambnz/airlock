import { GoodType } from './Order'
import { Ship } from './Ship'

export type StructureType = {
  allowedLocationTypes: string[]
  consumes: GoodType[]
  name: string
  price: number
  produces: GoodType[]
  type: string
}

export type ListStructureTypesResponse = {
  structures: StructureType[]
}

export type Structure = {
  active: boolean
  consumes: GoodType[]
  id: string
  inventory: Material[]
  location: string
  ownedBy: { username: string }
  produces: GoodType[]
  status: string
  type: StructureCategory
}

export type ListOwnStructuresResponse = {
  structures: Structure[]
}

export type OwnStructureResponse = {
  structure: Structure
}

export type Material = {
  good: GoodType
  quantity: number
  targetQuantity?: number
}

export enum StructureCategory {
  DRONE_FACTORY = 'Drone Factory',
  FUEL_REFINERY = 'Fuel Refinery',
  RARE_EARTH_MINE = 'Rare Earth Mine',
  MINE = 'Mine',
  CHEMICAL_PLANT = 'Chemical Plant',
  ELECTRONICS_FACTORY = 'Electronics Factory',
  FARM = 'Farm',
  FABRICATION_PLANT = 'Fabrication Plant',
  RESEARCH_OUTPOST = 'Research Outpost',
  EXPLOSIVES_FACTORY = 'Explosives Factory',
  SHIPYARD = 'Shipyard',
}

export type CreateStructureResponse = {
  structure: Structure
}

export type OwnStructureDepositResponse = {
  deposit: Material[]
  ship: Ship
  structure: Structure
}

export type OwnStructureWithdrawResponse = {
  ship: Ship
  structure: Structure
  transfer: Material
}

export type StructureResponse = {
  structure: Structure
}

export type StructureDepositResponse = {
  deposit: Material[]
  ship: Ship
  structure: Structure
}
