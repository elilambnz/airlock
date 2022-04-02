import { default as axios } from '../../utils/axiosInstance'

import {
  DockShipResponse,
  JumpCooldownResponse,
  JumpShipResponse,
  OrbitShipResponse,
  RefuelShipResponse,
  ShipNavigationResponse,
  ShipNavigationStatusResponse,
} from '../../types/Navigation'

const BASE_ROUTE = 'my/ships'

const dockShip = async (shipSymbol: string) => {
  try {
    const response: { data: DockShipResponse } = await axios.post(
      `${BASE_ROUTE}/${shipSymbol}/dock`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

const orbitShip = async (shipSymbol: string) => {
  try {
    const response: { data: OrbitShipResponse } = await axios.post(
      `${BASE_ROUTE}/${shipSymbol}/orbit`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

const jumpShip = async (shipSymbol: string) => {
  try {
    const response: { data: JumpShipResponse } = await axios.post(
      `${BASE_ROUTE}/${shipSymbol}/jump`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

const getJumpCooldown = async (shipSymbol: string) => {
  try {
    const response: { data: JumpCooldownResponse } = await axios.get(
      `${BASE_ROUTE}/${shipSymbol}/jump`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

const refuelShip = async (shipSymbol: string) => {
  try {
    const response: { data: RefuelShipResponse } = await axios.post(
      `${BASE_ROUTE}/${shipSymbol}/refuel`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

const navigateShip = async (shipSymbol: string, destination: string) => {
  try {
    const response: { data: ShipNavigationResponse } = await axios.post(
      `${BASE_ROUTE}/${shipSymbol}/navigate`,
      {
        destination,
      }
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

const getShipNavigationStatus = async (shipSymbol: string) => {
  try {
    const response: { data: ShipNavigationStatusResponse } = await axios.get(
      `${BASE_ROUTE}/${shipSymbol}/navigate`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

export {
  dockShip,
  orbitShip,
  jumpShip,
  getJumpCooldown,
  refuelShip,
  navigateShip,
  getShipNavigationStatus,
}
