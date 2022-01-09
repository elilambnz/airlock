import { Good } from '../../types/Order'
import {
  StructureResponse,
  StrucutreDepositResponse,
} from '../../types/Structure'
import axios from '../axios'

const BASE_ROUTE = 'structures'

const getStructureInfo = async (id: string) => {
  try {
    // TEST
    return {
      structure: {
        completed: true,
        id: 'ckonbz97y1650ninzroui51fm',
        materials: [
          {
            good: Good['MACHINERY'],
            quantity: 12000,
            targetQuantity: 15000,
          },
          {
            good: Good['CONSTRUCTION_MATERIALS'],
            quantity: 20000,
            targetQuantity: 25000,
          },
          {
            good: Good['ELECTRONICS'],
            quantity: 8000,
            targetQuantity: 10000,
          },
          {
            good: Good['METALS'],
            quantity: 120000,
            targetQuantity: 150000,
          },
        ],
        name: 'Warp Gate',
        stability: 0.8,
      },
    }

    const response: { data: StructureResponse } = await axios.get(
      `${BASE_ROUTE}/${id}`
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const depositToStructure = async (
  id: string,
  shipId: string,
  good: string,
  quantity: number
) => {
  try {
    const response: { data: StrucutreDepositResponse } = await axios.post(
      `${BASE_ROUTE}/${id}/deposit`,
      {
        shipId,
        good,
        quantity,
      }
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export { getStructureInfo, depositToStructure }
