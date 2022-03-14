import { default as axios } from '../../utils/axiosInstance'

import { TradeCargoResponse } from '../../types/Trade'

const BASE_ROUTE = 'my/ships'

const purchaseCargo = async (
  shipSymbol: string,
  tradeSymbol: string,
  units: number
) => {
  try {
    const response: { data: TradeCargoResponse } = await axios.post(
      `${BASE_ROUTE}/${shipSymbol}/purchase`,
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

const sellCargo = async (
  shipSymbol: string,
  tradeSymbol: string,
  units: number
) => {
  try {
    const response: { data: TradeCargoResponse } = await axios.post(
      `${BASE_ROUTE}/${shipSymbol}/sell`,
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

export { purchaseCargo, sellCargo }
