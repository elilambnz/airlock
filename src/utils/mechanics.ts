import { createPurchaseOrder, createSellOrder } from '../api/routes/my'
import { GoodType } from '../types/Order'
import { Ship } from '../types/Ship'

export const refuel = async (
  ship: Ship,
  fuelRequired: number
): Promise<{ credits: number }> => {
  let credits = 0
  while (fuelRequired > 0) {
    const purchaseResult = await createPurchaseOrder(
      ship.id,
      GoodType.FUEL,
      Math.min(fuelRequired, ship.loadingSpeed)
    )
    fuelRequired -= ship.loadingSpeed
    credits = purchaseResult.credits
  }
  return { credits }
}

export const purchase = async (
  ship: Ship,
  goodType: GoodType,
  quantity: number
): Promise<{ credits: number }> => {
  let credits = 0
  while (quantity > 0) {
    const purchaseResult = await createPurchaseOrder(
      ship.id,
      goodType,
      Math.min(quantity, ship.loadingSpeed)
    )
    quantity -= ship.loadingSpeed
    credits = purchaseResult.credits
  }
  return { credits }
}

export const sell = async (
  ship: Ship,
  goodType: GoodType,
  quantity: number
): Promise<{ credits: number }> => {
  let credits = 0
  while (quantity > 0) {
    const purchaseResult = await createSellOrder(
      ship.id,
      goodType,
      Math.min(quantity, ship.loadingSpeed)
    )
    quantity -= ship.loadingSpeed
    credits = purchaseResult.credits
  }
  return { credits }
}
