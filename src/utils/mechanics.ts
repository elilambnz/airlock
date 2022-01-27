import { createPurchaseOrder } from '../api/routes/my'
import { GoodType } from '../types/Order'
import { Ship } from '../types/Ship'

export const refuel = async (
  fuelRequired: number,
  ship: Ship
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
