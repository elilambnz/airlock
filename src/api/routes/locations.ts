import axios from '../axios'

const BASE_ROUTE = 'locations'

const getLocationMarketplace = async (locationSymbol: string) => {
  try {
    const response = await axios.get(
      `${BASE_ROUTE}/${locationSymbol}/marketplace`
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export { getLocationMarketplace }
