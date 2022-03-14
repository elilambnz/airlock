import { default as axios } from '../../utils/axiosInstance'

import { RegisterAgentResponse, AgentResponse } from '../../types/Agent'

const BASE_ROUTE = 'my'

const registerNewAgent = async (symbol: string, faction: string) => {
  try {
    const response: { data: RegisterAgentResponse } = await axios.post(
      'agents',
      {
        symbol,
        faction,
      }
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

const getMyAgent = async () => {
  try {
    const response: { data: AgentResponse } = await axios.get(
      `${BASE_ROUTE}/agent`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

export { registerNewAgent, getMyAgent }
