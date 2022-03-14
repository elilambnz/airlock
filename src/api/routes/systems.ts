import { default as axios } from '../../utils/axiosInstance'

import { ListSystemsResponse, SystemResponse } from '../../types/System'

const BASE_ROUTE = 'systems'

const listSystems = async () => {
  try {
    const response: { data: ListSystemsResponse } = await axios.get(
      `${BASE_ROUTE}`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

const getSystemInfo = async (systemSymbol: string) => {
  try {
    const response: { data: SystemResponse } = await axios.get(
      `${BASE_ROUTE}/${systemSymbol}`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

export { listSystems, getSystemInfo }
