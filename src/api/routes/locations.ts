import { LocationMarketplaceResponse } from '../../types/Location'
import { default as axios } from '../../utils/axiosInstance'

const BASE_ROUTE = 'locations'

const getLocationMarketplace = async (locationSymbol: string) => {
  try {
    const response: { data: LocationMarketplaceResponse } = await axios.get(
      `${BASE_ROUTE}/${locationSymbol}/marketplace`
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export { getLocationMarketplace }
