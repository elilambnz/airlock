import { GoodType } from './Order'
import { Ship } from './Ship'

export type ListStructureTypesResponse = {
  structures: StructureType[]
}

export type StructureType = {
  allowedLocationTypes: string[]
  consumes: GoodType[]
  name: string
  price: number
  produces: GoodType[]
  type: string
}

export type ListOwnStructuresResponse = {
  structures: OwnStructure[]
}

export type OwnStructureResponse = {
  structure: OwnStructure
}

export type OwnStructure = {
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

export type Material = {
  good: GoodType
  quantity: number
}

export enum StructureCategory {
  FARM = 'FARM',
  SHIPYARD = 'SHIPYARD',
  TRADING_POST = 'TRADING_POST',
}

export type CreateStructureResponse = {
  structure: OwnStructure
}

export type OwnStructureDepositResponse = {
  deposit: Material[]
  ship: Ship
  structure: OwnStructure
}

export type OwnStructureWithdrawResponse = {
  ship: Ship
  structure: OwnStructure
  transfer: Material
}

export type StructureResponse = {
  structure: Structure
}

export type Structure = {
  completed: boolean
  id: string
  materials: StructureMaterial[]
  name: string
  stability: number
}

export type StructureDepositResponse = {
  deposit: Material[]
  ship: Ship
  structure: Structure
}

export type StructureMaterial = Material & {
  targetQuantity: number
}
