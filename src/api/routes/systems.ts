import { ListShipsResponse } from '../../types/Ship'
import {
  ListSystemFlightPlansResponse,
  ListSystemLocationsResponse,
  SystemDockedShipsResponse,
  SystemsResponse,
} from '../../types/System'
import axios from '../axios'

const BASE_ROUTE = 'systems'

const getShipListings = async (systemSymbol: string) => {
  try {
    const response: { data: ListShipsResponse } = await axios.get(
      `${BASE_ROUTE}/${systemSymbol}/ship-listings`
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const getSystemInfo = async (systemSymbol: string) => {
  try {
    const response: { data: SystemsResponse } = await axios.get(
      `${BASE_ROUTE}/${systemSymbol}`
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const getSystemLocations = async (systemSymbol: string) => {
  try {
    const response: { data: ListSystemLocationsResponse } = await axios.get(
      `${BASE_ROUTE}/${systemSymbol}/locations`
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const getSystemFlightPlans = async (systemSymbol: string) => {
  try {
    const response: { data: ListSystemFlightPlansResponse } = await axios.get(
      `${BASE_ROUTE}/${systemSymbol}/flight-plans`
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const getSystemDockedShips = async (systemSymbol: string) => {
  try {
    const response: { data: SystemDockedShipsResponse } = await axios.get(
      `${BASE_ROUTE}/${systemSymbol}/ships`
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export {
  getShipListings,
  getSystemInfo,
  getSystemLocations,
  getSystemFlightPlans,
  getSystemDockedShips,
}
