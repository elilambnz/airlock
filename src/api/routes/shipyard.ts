import { default as axios } from '../../utils/axiosInstance'

import {
  ListShipyardListingsResponse,
  ListShipyardsResponse,
  PurchaseShipResponse,
  ShipyardResponse,
} from '../../types/Shipyard'

const BASE_ROUTE = 'systems'

const listShipyards = async (systemSymbol: string) => {
  try {
    const response: { data: ListShipyardsResponse } = await axios.get(
      `${BASE_ROUTE}/${systemSymbol}/shipyards`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

const getShipyardInfo = async (
  systemSymbol: string,
  waypointSymbol: string
) => {
  try {
    const response: { data: ShipyardResponse } = await axios.get(
      `${BASE_ROUTE}/${systemSymbol}/shipyards/${waypointSymbol}`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

const listShipyardListings = async (
  systemSymbol: string,
  waypointSymbol: string
) => {
  try {
    const response: { data: ListShipyardListingsResponse } = await axios.get(
      `${BASE_ROUTE}/${systemSymbol}/shipyards/${waypointSymbol}/ships`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

const purchaseShip = async (id: string) => {
  try {
    const response: { data: PurchaseShipResponse } = await axios.post(
      'my/ships',
      {
        id,
      }
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

export { listShipyards, getShipyardInfo, listShipyardListings, purchaseShip }
