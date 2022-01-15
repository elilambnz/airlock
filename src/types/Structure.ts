import { Good } from './Order'
import { Ship } from './Ship'

export type ListStructureTypesResponse = {
  structures: StructureType[]
}

export type StructureType = {
  allowedLocationTypes: string[]
  consumes: Good[]
  name: string
  price: number
  produces: Good[]
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
  consumes: Good[]
  id: string
  inventory: Material[]
  location: string
  ownedBy: { username: string }
  produces: Good[]
  status: string
  type: StructureCategory
}

export type Material = {
  good: Good
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

export type WarpJumpResponse = {
  ship: Ship
  structure: Structure
}
