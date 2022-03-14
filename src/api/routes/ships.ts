import { default as axios } from '../../utils/axiosInstance'

import {
  JettisonCargoResponse,
  ListShipsResponse,
  ScanCooldownResponse,
  ScanResponse,
  ShipResponse,
} from '../../types/Ship'

const BASE_ROUTE = 'my/ships'

const listShips = async () => {
  try {
    const response: { data: ListShipsResponse } = await axios.get(
      `${BASE_ROUTE}`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

const getShipInfo = async (shipSymbol: string) => {
  try {
    const response: { data: ShipResponse } = await axios.get(
      `${BASE_ROUTE}/${shipSymbol}`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

const scan = async (shipSymbol: string) => {
  try {
    const response: { data: ScanResponse } = await axios.post(
      `${BASE_ROUTE}/${shipSymbol}/scan`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

const getScanCooldown = async (shipSymbol: string) => {
  try {
    const response: { data: ScanCooldownResponse } = await axios.get(
      `${BASE_ROUTE}/${shipSymbol}/scan`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

const jettisonCargo = async (
  shipSymbol: string,
  tradeSymbol: string,
  units: number
) => {
  try {
    const response: { data: JettisonCargoResponse } = await axios.post(
      `${BASE_ROUTE}/${shipSymbol}/jettison`,
      {
        tradeSymbol,
        units,
      }
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

export { listShips, getShipInfo, scan, getScanCooldown, jettisonCargo }
