import { ListLoanTypesResponse } from '../../types/Loan'
import { ListGoodTypesResponse } from '../../types/Order'
import { ListShipTypesResponse } from '../../types/Ship'
import { ListStructureTypesResponse } from '../../types/Structure'
import { default as axios } from '../../utils/axiosInstance'

const BASE_ROUTE = 'types'

const listGoodTypes = async () => {
  try {
    const response: { data: ListGoodTypesResponse } = await axios.get(
      `${BASE_ROUTE}/goods`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response.data.error
  }
}

const listShipTypes = async () => {
  try {
    const response: { data: ListShipTypesResponse } = await axios.get(
      `${BASE_ROUTE}/ships`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response.data.error
  }
}

const listLoanTypes = async () => {
  try {
    const response: { data: ListLoanTypesResponse } = await axios.get(
      `${BASE_ROUTE}/loans`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response.data.error
  }
}

const listStructureTypes = async () => {
  try {
    const response: { data: ListStructureTypesResponse } = await axios.get(
      `${BASE_ROUTE}/structures`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response.data.error
  }
}

export { listGoodTypes, listShipTypes, listLoanTypes, listStructureTypes }
