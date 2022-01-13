import {
  LocationMarketplaceResponse,
  LocationStructuresResponse,
} from '../../types/Location'
import { default as axios } from '../../utils/axiosInstance'

const BASE_ROUTE = 'locations'

const getLocationMarketplace = async (locationSymbol: string) => {
  try {
    const response: { data: LocationMarketplaceResponse } = await axios.get(
      `${BASE_ROUTE}/${locationSymbol}/marketplace`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response.data.error
  }
}

const getLocationStructures = async (locationSymbol: string) => {
  try {
    const response: { data: LocationStructuresResponse } = await axios.get(
      `${BASE_ROUTE}/${locationSymbol}/Structures`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response.data.error
  }
}

export { getLocationMarketplace, getLocationStructures }
