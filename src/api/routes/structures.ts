import {
  StructureResponse,
  StructureDepositResponse,
} from '../../types/Structure'
import { default as axios } from '../../utils/axiosInstance'

const BASE_ROUTE = 'structures'

const getStructureInfo = async (id: string) => {
  try {
    const response: { data: StructureResponse } = await axios.get(
      `${BASE_ROUTE}/${id}`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response.data.error
  }
}

const depositToStructure = async (
  id: string,
  shipId: string,
  good: string,
  quantity: number
) => {
  try {
    const response: { data: StructureDepositResponse } = await axios.post(
      `${BASE_ROUTE}/${id}/deposit`,
      {
        shipId,
        good,
        quantity,
      }
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response.data.error
  }
}

export { getStructureInfo, depositToStructure }
