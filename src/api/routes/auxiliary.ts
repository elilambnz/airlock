import {
  TradeRoute,
  TradeRouteEvent,
  TradeRouteStatus,
} from '../../types/Automation'
import {
  TradingRoutesResponse,
  CreateTradingRoutesResponse,
  RemoveTradingRoutesResponse,
} from '../../types/Auxiliary'
import { default as axios } from '../../utils/axiosInstance'

const BASE_URL = process.env.REACT_APP_AUXILIARY_API_URL

const BASE_ROUTE = 'routes'

const getTradingRoutes = async () => {
  try {
    const response: { data: TradingRoutesResponse } = await axios.get(
      `${BASE_ROUTE}`,
      {
        baseURL: BASE_URL,
      }
    )
    const routes = response.data.map((route) => ({
      ...route,
      events: JSON.parse(route.events),
      status: TradeRouteStatus.ACTIVE,
    })) as TradeRoute[]
    return routes
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

const createTradingRoute = async (
  events: TradeRouteEvent[],
  assignedShips: string[],
  autoRefuel: boolean
) => {
  try {
    const response: { data: CreateTradingRoutesResponse } = await axios.post(
      `${BASE_ROUTE}`,
      {
        events,
        assignedShips,
        autoRefuel,
      },
      {
        baseURL: BASE_URL,
      }
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

const removeTradingRoute = async (id: string, version: number) => {
  try {
    const response: { data: RemoveTradingRoutesResponse } = await axios.delete(
      `${BASE_ROUTE}/${id}?version=${version}`,
      {
        baseURL: BASE_URL,
      }
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

export { getTradingRoutes, createTradingRoute, removeTradingRoute }
