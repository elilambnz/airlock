import { default as axios } from '../../utils/axiosInstance'

import {
  ChartWaypointResponse,
  ListSystemsResponse,
  ListWaypointsResponse,
  SystemResponse,
  WaypointResponse,
} from '../../types/System'

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

const chartWaypoint = async (shipSymbol: string) => {
  try {
    const response: { data: ChartWaypointResponse } = await axios.post(
      `${BASE_ROUTE}/${shipSymbol}/chart`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

const listWaypoints = async (systemSymbol: string) => {
  try {
    const response: { data: ListWaypointsResponse } = await axios.get(
      `${BASE_ROUTE}/${systemSymbol}/waypoints`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

const getWaypointInfo = async (
  systemSymbol: string,
  waypointSymbol: string
) => {
  try {
    const response: { data: WaypointResponse } = await axios.get(
      `${BASE_ROUTE}/${systemSymbol}/waypoints/${waypointSymbol}`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

export {
  listSystems,
  getSystemInfo,
  chartWaypoint,
  listWaypoints,
  getWaypointInfo,
}
