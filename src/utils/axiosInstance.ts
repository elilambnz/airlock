import axios from 'axios'
import { getValue, API_TOKEN_KEY } from './browserStorage'

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
})

axiosInstance.interceptors.request.use(
  (config) => {
    const apiToken = getValue(API_TOKEN_KEY, true) ?? getValue(API_TOKEN_KEY)
    if (apiToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${apiToken}`,
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

export default axiosInstance
