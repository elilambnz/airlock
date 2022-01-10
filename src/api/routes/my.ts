import { default as axios } from '../../utils/axiosInstance'

import { AccountResponse } from '../../types/Account'
import {
  ListShipsResponse,
  ShipResponse,
  ShipJettisonCargoResponse,
  ScrapShipResponse,
  TransferShipCargoResponse,
  BuyShipResponse,
} from '../../types/Ship'
import {
  CreateLoanResponse,
  ListLoansResponse,
  PayOffLoanResponse,
} from '../../types/Loan'
import {
  CreateStructureResponse,
  ListOwnStructuresResponse,
  OwnStructureResponse,
  OwnStructureWithdrawResponse,
  OwnStrucutreDepositResponse,
  StructureCategory,
} from '../../types/Structure'
import { FlightPlanResponse } from '../../types/FlightPlan'
import { Good, OrderResponse } from '../../types/Order'

const BASE_ROUTE = 'my'

const getMyAccount = async () => {
  try {
    const response: { data: AccountResponse } = await axios.get(
      `${BASE_ROUTE}/account`
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const listMyShips = async () => {
  try {
    const response: { data: ListShipsResponse } = await axios.get(
      `${BASE_ROUTE}/ships`
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const getShipInfo = async (id: string) => {
  try {
    const response: { data: ShipResponse } = await axios.get(
      `${BASE_ROUTE}/ships/${id}`
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const jettisonShipCargo = async (
  id: string,
  good: string,
  quantity: number
) => {
  try {
    const response: { data: ShipJettisonCargoResponse } = await axios.post(
      `${BASE_ROUTE}/ships/${id}/jettison`,
      {
        good,
        quantity,
      }
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const scrapShip = async (id: string) => {
  try {
    const response: { data: ScrapShipResponse } = await axios.delete(
      `${BASE_ROUTE}/ships/${id}`
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const transferShipCargo = async (
  id: string,
  toShipId: string,
  good: string,
  quantity: number
) => {
  try {
    const response: { data: TransferShipCargoResponse } = await axios.post(
      `${BASE_ROUTE}/ships/${id}/transfer`,
      {
        toShipId,
        good,
        quantity,
      }
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const buyShip = async (location: string, type: string) => {
  try {
    const response: { data: BuyShipResponse } = await axios.post(
      `${BASE_ROUTE}/ships`,
      {
        location,
        type,
      }
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const listMyLoans = async () => {
  try {
    const response: { data: ListLoansResponse } = await axios.get(
      `${BASE_ROUTE}/loans`
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const payOffLoan = async (id: string) => {
  try {
    const response: { data: PayOffLoanResponse } = await axios.put(
      `${BASE_ROUTE}/loans/${id}`
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const takeOutLoan = async (type: string) => {
  try {
    const response: { data: CreateLoanResponse } = await axios.post(
      `${BASE_ROUTE}/loans`,
      {
        type,
      }
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const listMyStructures = async () => {
  try {
    const response: { data: ListOwnStructuresResponse } = await axios.get(
      `${BASE_ROUTE}/structures`
    )

    // TEST
    process.env.NODE_ENV === 'development' &&
      response.data.structures.push({
        active: false,
        consumes: [Good.DRONES, Good.MACHINERY],
        id: 'ckon8d0j400291vnzmgwahsyz',
        inventory: [
          {
            good: Good.FOOD,
            quantity: 0,
          },
          {
            good: Good.MACHINERY,
            quantity: 0,
          },
          {
            good: Good.DRONES,
            quantity: 10,
          },
        ],
        location: 'OE-PM',
        ownedBy: {
          username: 'testuser0',
        },
        produces: [Good.FOOD],
        status: 'Production halted. Required inventory is missing.',
        type: StructureCategory['FARM'],
      })

    return response.data
  } catch (error) {
    console.error(error)
  }
}

const getMyStructureInfo = async (id: string) => {
  try {
    const response: { data: OwnStructureResponse } = await axios.get(
      `${BASE_ROUTE}/structures/${id}`
    )

    return response.data
  } catch (error) {
    console.error(error)
  }
}

const createNewStructure = async (location: string, type: string) => {
  try {
    const response: { data: CreateStructureResponse } = await axios.post(
      `${BASE_ROUTE}/structures`,
      {
        location,
        type,
      }
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const depositToMyStructure = async (
  structureId: string,
  shipId: string,
  good: string,
  quantity: number
) => {
  try {
    const response: { data: OwnStrucutreDepositResponse } = await axios.post(
      `${BASE_ROUTE}/structures/${structureId}/deposit`,
      {
        shipId,
        good,
        quantity,
      }
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const withdrawFromMyStructure = async (
  structureId: string,
  shipId: string,
  good: string,
  quantity: number
) => {
  try {
    const response: { data: OwnStructureWithdrawResponse } = await axios.post(
      `${BASE_ROUTE}/structures/${structureId}/transfer`,
      {
        shipId,
        good,
        quantity,
      }
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const createNewFlightPlan = async (shipId: string, destination: string) => {
  try {
    const response: { data: FlightPlanResponse } = await axios.post(
      `${BASE_ROUTE}/flight-plans`,
      {
        shipId,
        destination,
      }
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const getFlightPlanInfo = async (id: string) => {
  try {
    const response: { data: FlightPlanResponse } = await axios.get(
      `${BASE_ROUTE}/flight-plans/${id}`
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const createPurchaseOrder = async (
  shipId: string,
  good: string,
  quantity: number
) => {
  try {
    const response: { data: OrderResponse } = await axios.post(
      `${BASE_ROUTE}/purchase-orders`,
      {
        shipId,
        good,
        quantity,
      }
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const createSellOrder = async (
  shipId: string,
  good: string,
  quantity: number
) => {
  try {
    const response: { data: OrderResponse } = await axios.post(
      `${BASE_ROUTE}/sell-orders`,
      {
        shipId,
        good,
        quantity,
      }
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export {
  getMyAccount,
  listMyShips,
  getShipInfo,
  jettisonShipCargo,
  scrapShip,
  transferShipCargo,
  buyShip,
  listMyLoans,
  payOffLoan,
  takeOutLoan,
  listMyStructures,
  getMyStructureInfo,
  createNewStructure,
  depositToMyStructure,
  withdrawFromMyStructure,
  createNewFlightPlan,
  getFlightPlanInfo,
  createPurchaseOrder,
  createSellOrder,
}
