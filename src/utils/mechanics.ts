import { createPurchaseOrder, createSellOrder } from '../api/routes/my'
import { GoodType } from '../types/Order'
import { Ship } from '../types/Ship'

export const refuel = async (ship: Ship, fuelRequired: number) => {
  while (fuelRequired > 0) {
    await createPurchaseOrder(
      ship.id,
      GoodType.FUEL,
      Math.min(fuelRequired, ship.loadingSpeed)
    )
    fuelRequired -= ship.loadingSpeed
  }
  return
}

export const purchase = async (
  ship: Ship,
  goodType: GoodType,
  quantity: number
) => {
  while (quantity > 0) {
    await createPurchaseOrder(
      ship.id,
      goodType,
      Math.min(quantity, ship.loadingSpeed)
    )
    quantity -= ship.loadingSpeed
  }
  return
}

export const sell = async (
  ship: Ship,
  goodType: GoodType,
  quantity: number
) => {
  while (quantity > 0) {
    await createSellOrder(
      ship.id,
      goodType,
      Math.min(quantity, ship.loadingSpeed)
    )
    quantity -= ship.loadingSpeed
  }
}
