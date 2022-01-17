import { GenerateTokenResponse } from '../../types/User'
import { default as axios } from '../../utils/axiosInstance'

const BASE_ROUTE = 'users'

const generateToken = async (username: string) => {
  try {
    const response: { data: GenerateTokenResponse } = await axios.post(
      `${BASE_ROUTE}/${username}/claim`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

export { generateToken }
