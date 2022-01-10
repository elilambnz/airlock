import { LeaderboardNetWorthResponse, StatusResponse } from '../../types/Game'
import { default as axios } from '../../utils/axiosInstance'

const BASE_ROUTE = 'game'

const getGameStatus = async () => {
  try {
    const response: { data: StatusResponse } = await axios.get(
      `${BASE_ROUTE}/status`
    )
    return response.data?.status
  } catch (error) {
    console.error(error)
  }
}

const getLeaderboardNetWorth = async () => {
  try {
    const response: { data: LeaderboardNetWorthResponse } = await axios.get(
      `${BASE_ROUTE}/leaderboard/net-worth`
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export { getGameStatus, getLeaderboardNetWorth }
