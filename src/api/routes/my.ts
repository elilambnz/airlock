import axios from '../axios'

const BASE_ROUTE = 'my'

const getMyAccount = async () => {
  try {
    const response = await axios.get(`${BASE_ROUTE}/account`)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const getMyShips = async () => {
  try {
    const response = await axios.get(`${BASE_ROUTE}/ships`)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const getShipInfo = async (id: string) => {
  try {
    const response = await axios.get(`${BASE_ROUTE}/ships/${id}`)
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
    const response = await axios.post(`${BASE_ROUTE}/ships/${id}/jettison`, {
      good,
      quantity,
    })
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const scrapShip = async (id: string) => {
  try {
    const response = await axios.delete(`${BASE_ROUTE}/ships/${id}`)
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
    const response = await axios.post(`${BASE_ROUTE}/ships/${id}/transfer`, {
      toShipId,
      good,
      quantity,
    })
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const buyShip = async (location: string, type: string) => {
  try {
    const response = await axios.post(`${BASE_ROUTE}/ships`, {
      location,
      type,
    })
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const getMyLoans = async () => {
  try {
    const response = await axios.get(`${BASE_ROUTE}/loans`)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const payOffLoan = async (id: string) => {
  try {
    const response = await axios.put(`${BASE_ROUTE}/loans/${id}`)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const takeOutLoan = async (type: string) => {
  try {
    const response = await axios.post(`${BASE_ROUTE}/loans`, {
      type,
    })
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const getMyStructures = async () => {
  try {
    const response = await axios.get(`${BASE_ROUTE}/structures`)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const getMyStructureInfo = async (id: string) => {
  try {
    const response = await axios.get(`${BASE_ROUTE}/structures/${id}`)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const createNewStructure = async (location: string, type: string) => {
  try {
    const response = await axios.post(`${BASE_ROUTE}/structures`, {
      location,
      type,
    })
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
    const response = await axios.post(
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
    const response = await axios.post(
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
    const response = await axios.post(`${BASE_ROUTE}/flight-plans`)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const getFlightPlanInfo = async (id: string) => {
  try {
    const response = await axios.get(`${BASE_ROUTE}/flight-plans/${id}`)
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
    const response = await axios.post(`${BASE_ROUTE}/purchase-orders`, {
      shipId,
      good,
      quantity,
    })
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
    const response = await axios.post(`${BASE_ROUTE}/sell-orders`, {
      shipId,
      good,
      quantity,
    })
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export {
  getMyAccount,
  getMyShips,
  getShipInfo,
  jettisonShipCargo,
  scrapShip,
  transferShipCargo,
  buyShip,
  getMyLoans,
  payOffLoan,
  takeOutLoan,
  getMyStructures,
  getMyStructureInfo,
  createNewStructure,
  depositToMyStructure,
  withdrawFromMyStructure,
  createNewFlightPlan,
  getFlightPlanInfo,
  createPurchaseOrder,
  createSellOrder,
}
