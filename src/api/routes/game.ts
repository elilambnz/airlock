import { LeaderboardNetWorthResponse, StatusResponse } from '../../types/Game'
import { default as axios } from '../../utils/axiosInstance'

const BASE_ROUTE = 'game'

const getGameStatus = async () => {
  try {
    const response: { data: StatusResponse } = await axios.get(
      `${BASE_ROUTE}/status`
    )
    return response.data?.status
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

const getLeaderboardNetWorth = async () => {
  try {
    const response: { data: LeaderboardNetWorthResponse } = await axios.get(
      `${BASE_ROUTE}/leaderboard/net-worth`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

export { getGameStatus, getLeaderboardNetWorth }
