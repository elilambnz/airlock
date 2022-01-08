import {
  StructureResponse,
  StrucutreDepositResponse,
} from '../../types/Structure'
import axios from '../axios'

const BASE_ROUTE = 'structures'

const getStructureInfo = async (id: string) => {
  try {
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
