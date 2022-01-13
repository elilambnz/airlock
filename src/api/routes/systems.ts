import { ListShipListingsResponse } from '../../types/Ship'
import {
  ListSystemFlightPlansResponse,
  ListSystemLocationsResponse,
  SystemDockedShipsResponse,
  SystemsResponse,
} from '../../types/System'
import { default as axios } from '../../utils/axiosInstance'

const BASE_ROUTE = 'systems'

const getShipListings = async (systemSymbol: string) => {
  try {
    const response: { data: ListShipListingsResponse } = await axios.get(
      `${BASE_ROUTE}/${systemSymbol}/ship-listings`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response.data.error
  }
}

const getSystemInfo = async (systemSymbol: string) => {
  try {
    const response: { data: SystemsResponse } = await axios.get(
      `${BASE_ROUTE}/${systemSymbol}`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response.data.error
  }
}

const getSystemLocations = async (systemSymbol: string) => {
  try {
    const response: { data: ListSystemLocationsResponse } = await axios.get(
      `${BASE_ROUTE}/${systemSymbol}/locations`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response.data.error
  }
}

const getSystemFlightPlans = async (systemSymbol: string) => {
  try {
    const response: { data: ListSystemFlightPlansResponse } = await axios.get(
      `${BASE_ROUTE}/${systemSymbol}/flight-plans`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response.data.error
  }
}

const getSystemDockedShips = async (systemSymbol: string) => {
  try {
    const response: { data: SystemDockedShipsResponse } = await axios.get(
      `${BASE_ROUTE}/${systemSymbol}/ships`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response.data.error
  }
}

export {
  getShipListings,
  getSystemInfo,
  getSystemLocations,
  getSystemFlightPlans,
  getSystemDockedShips,
}
