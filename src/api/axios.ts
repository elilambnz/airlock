import axios from 'axios'

const baseURL = process.env.REACT_APP_API_URL
const token = process.env.REACT_APP_TOKEN

const instance = axios.create({
  baseURL: baseURL,
  headers: {
    Authorization: `Bearer ${token}`,
  },
})

export default instance
