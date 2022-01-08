import axios from '../axios'

const BASE_ROUTE = 'game'

const getGameStatus = async () => {
  try {
    const response = await axios.get(`${BASE_ROUTE}/status`)
    return response.data?.status
  } catch (error) {
    console.error(error)
  }
}

const getLeaderboard = async () => {
  try {
    const response = await axios.get(`${BASE_ROUTE}/leaderboard/net-worth`)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export { getGameStatus, getLeaderboard }
