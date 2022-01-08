import axios from '../axios'

const BASE_ROUTE = 'types'

const getGoodsTypes = async () => {
  try {
    const response = await axios.get(`${BASE_ROUTE}/goods`)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const getShipsTypes = async () => {
  try {
    const response = await axios.get(`${BASE_ROUTE}/ships`)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const getLoansTypes = async () => {
  try {
    const response = await axios.get(`${BASE_ROUTE}/loans`)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const getStructuresTypes = async () => {
  try {
    const response = await axios.get(`${BASE_ROUTE}/structures`)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export { getGoodsTypes, getShipsTypes, getLoansTypes, getStructuresTypes }
