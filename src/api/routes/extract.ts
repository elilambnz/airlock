import { default as axios } from '../../utils/axiosInstance'

import {
  ExtractCooldownResponse,
  ExtractResourcesResponse,
  SurveyCooldownResponse,
  SurveyWaypointResponse,
} from '../../types/Extract'

const BASE_ROUTE = 'my/ships'

const extractResources = async (shipSymbol: string) => {
  try {
    const response: { data: ExtractResourcesResponse } = await axios.post(
      `${BASE_ROUTE}/${shipSymbol}/extract`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

const getExtractCooldown = async (shipSymbol: string) => {
  try {
    const response: { data: ExtractCooldownResponse } = await axios.get(
      `${BASE_ROUTE}/${shipSymbol}/extract`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

const surveyWaypoint = async (shipSymbol: string) => {
  try {
    const response: { data: SurveyWaypointResponse } = await axios.post(
      `${BASE_ROUTE}/${shipSymbol}/survey`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

const getSurveyCooldown = async (shipSymbol: string) => {
  try {
    const response: { data: SurveyCooldownResponse } = await axios.get(
      `${BASE_ROUTE}/${shipSymbol}/survey`
    )
    return response.data
  } catch (error: any) {
    console.error(error)
    throw error.response?.data?.error
  }
}

export {
  extractResources,
  getExtractCooldown,
  surveyWaypoint,
  getSurveyCooldown,
}
