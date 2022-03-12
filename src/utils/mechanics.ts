import {
  createPurchaseOrder,
  createSellOrder,
  depositToMyStructure,
  withdrawFromMyStructure,
} from '../api/routes/my'
import { depositToStructure } from '../api/routes/structures'
import { GoodType } from '../types/Order'
import { Ship } from '../types/Ship'

export const refuel = async (ship: Ship, fuelRequired: number) => {
  let lastResult
  while (fuelRequired > 0) {
    lastResult = await createPurchaseOrder(
      ship.id,
      GoodType.FUEL,
      Math.min(fuelRequired, ship.loadingSpeed)
    )
    fuelRequired -= ship.loadingSpeed
  }
  return lastResult
}

export const purchase = async (
  ship: Ship,
  goodType: string,
  quantity: number
) => {
  let lastResult
  while (quantity > 0) {
    lastResult = await createPurchaseOrder(
      ship.id,
      goodType,
      Math.min(quantity, ship.loadingSpeed)
    )
    quantity -= ship.loadingSpeed
  }
  return lastResult
}

export const sell = async (ship: Ship, goodType: string, quantity: number) => {
  let lastResult
  while (quantity > 0) {
    lastResult = await createSellOrder(
      ship.id,
      goodType,
      Math.min(quantity, ship.loadingSpeed)
    )
    quantity -= ship.loadingSpeed
  }
  return lastResult
}

export const withdraw = async (
  structureId: string,
  ship: Ship,
  goodType: string,
  quantity: number
) => {
  let lastResult
  while (quantity > 0) {
    lastResult = await withdrawFromMyStructure(
      structureId,
      ship.id,
      goodType,
      Math.min(quantity, ship.loadingSpeed)
    )
    quantity -= ship.loadingSpeed
  }
  return lastResult
}

export const deposit = async (
  structureId: string,
  ship: Ship,
  goodType: string,
  quantity: number
) => {
  let lastResult
  while (quantity > 0) {
    lastResult = await depositToMyStructure(
      structureId,
      ship.id,
      goodType,
      Math.min(quantity, ship.loadingSpeed)
    )
    quantity -= ship.loadingSpeed
  }
  return lastResult
}

export const depositToAnotherStructure = async (
  structureId: string,
  ship: Ship,
  goodType: string,
  quantity: number
) => {
  let lastResult
  while (quantity > 0) {
    lastResult = await depositToStructure(
      structureId,
      ship.id,
      goodType,
      Math.min(quantity, ship.loadingSpeed)
    )
    quantity -= ship.loadingSpeed
  }
  return lastResult
}
