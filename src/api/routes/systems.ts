import axios from '../axios'

const BASE_ROUTE = 'systems'

const getShipListings = async (systemSymbol: string) => {
  try {
    const response = await axios.get(
      `${BASE_ROUTE}/${systemSymbol}/ship-listings`
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const getSystemInfo = async (systemSymbol: string) => {
  try {
    const response = await axios.get(`${BASE_ROUTE}/${systemSymbol}`)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const getSystemLocations = async (systemSymbol: string) => {
  try {
    const response = await axios.get(`${BASE_ROUTE}/${systemSymbol}/locations`)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const getSystemFlightPlans = async (systemSymbol: string) => {
  try {
    const response = await axios.get(
      `${BASE_ROUTE}/${systemSymbol}/flight-plans`
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const getSystemDockedShips = async (systemSymbol: string) => {
  try {
    const response = await axios.get(`${BASE_ROUTE}/${systemSymbol}/ships`)
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
