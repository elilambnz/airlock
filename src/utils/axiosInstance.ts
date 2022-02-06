import axios from 'axios'
import rateLimit from 'axios-rate-limit'

import { getValue, API_TOKEN_KEY } from './browserStorage'

// NOTE: There's a rate limit of 2 requests/second with a burst of an extra 8/req/sec that replenishes over 8 seconds
// To make use of the burst capability, we need to have a custom rate limiter that will allow us to make the extra 8 requests/sec

const axiosInstance = rateLimit(
  axios.create({
    baseURL: process.env.REACT_APP_API_URL,
  }),
  { maxRequests: 1, perMilliseconds: 500 }
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
    const rateLimitRemaining = parseInt(
      response.headers['x-ratelimit-remaining']
    )
    if (rateLimitRemaining !== undefined) {
      console.debug('Requests remaining:', rateLimitRemaining)
    }

    return response
  },
  async (error) => {
    // Handle rate limit errors
    if (error.response.status === 429) {
      console.error('Rate limit was exceeded.')
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
