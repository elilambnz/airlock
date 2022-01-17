import axios from 'axios'
import rateLimit from 'axios-rate-limit'

import { getValue, API_TOKEN_KEY } from './browserStorage'

// NOTE: There's a rate limit of 2 requests/second with a burst of an extra 8/req/sec that replenishes over 8 seconds
const axiosInstance = rateLimit(
  axios.create({
    baseURL: process.env.REACT_APP_API_URL,
  }),
  { maxRequests: 8, perMilliseconds: 2000, maxRPS: 2 }
)

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

// axios response interceptor
axiosInstance.interceptors.response.use(
  async (response) => {
    const headers = response.headers
    if (headers['x-ratelimit-remaining'] === '0') {
      console.warn('Rate limit is about to be exceeded')
    }
    return response
  },
  async (error) => {
    if (error.response.status === 429) {
      console.warn('Rate limit was exceeded')
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
