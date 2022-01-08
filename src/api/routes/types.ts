import { ListLoanTypesResponse } from '../../types/Loan'
import { ListGoodTypesResponse } from '../../types/Order'
import { ListShipTypesResponse } from '../../types/Ship'
import { ListStructureTypesResponse } from '../../types/Structure'
import axios from '../axios'

const BASE_ROUTE = 'types'

const listGoodTypes = async () => {
  try {
    const response: { data: ListGoodTypesResponse } = await axios.get(
      `${BASE_ROUTE}/goods`
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const listShipTypes = async () => {
  try {
    const response: { data: ListShipTypesResponse } = await axios.get(
      `${BASE_ROUTE}/ships`
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const listLoanTypes = async () => {
  try {
    const response: { data: ListLoanTypesResponse } = await axios.get(
      `${BASE_ROUTE}/loans`
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const listStructureTypes = async () => {
  try {
    const response: { data: ListStructureTypesResponse } = await axios.get(
      `${BASE_ROUTE}/structures`
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export { listGoodTypes, listShipTypes, listLoanTypes, listStructureTypes }
