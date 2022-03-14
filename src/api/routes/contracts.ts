import { default as axios } from '../../utils/axiosInstance'

import { ListContractsResponse, ContractResponse } from '../../types/Contract'

const BASE_ROUTE = 'my/contracts'

const listContracts = async () => {
  try {
    const response: { data: ListContractsResponse } = await axios.get(
      `${BASE_ROUTE}`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

const getContractDetails = async (contractId: string) => {
  try {
    const response: { data: ContractResponse } = await axios.get(
      `${BASE_ROUTE}/${contractId}`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

const acceptContract = async (contractId: string) => {
  try {
    const response: { data: ContractResponse } = await axios.post(
      `${BASE_ROUTE}/contracts/${contractId}/accept`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

const deliverOnContract = async (shipSymbol: string) => {
  try {
    const response: { data: ContractResponse } = await axios.post(
      `my/ships/${shipSymbol}/deliver`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

export { listContracts, getContractDetails, acceptContract, deliverOnContract }
