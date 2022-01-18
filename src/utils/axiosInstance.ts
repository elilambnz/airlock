import axios, { AxiosResponseHeaders } from 'axios'

import { getValue, API_TOKEN_KEY } from './browserStorage'

// NOTE: There's a rate limit of 2 requests/second with a burst of an extra 8/req/sec that replenishes over 8 seconds
const INTERVAL_MS = 1000
let rateLimitLimit = 2
let rateLimitRemaining = 2
let pendingRequests = 0

const BURST_RATE_LIMIT = 8
const BURST_RATE_LIMIT_INTERVAL_MS = INTERVAL_MS * BURST_RATE_LIMIT
let burstRateRemaining = BURST_RATE_LIMIT

setInterval(() => {
  // Reset the burst rate limit
  burstRateRemaining = BURST_RATE_LIMIT
  console.debug('Burst rate limit reset, remaining:', burstRateRemaining)
}, BURST_RATE_LIMIT_INTERVAL_MS)

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
})

axiosInstance.interceptors.request.use(
  (config) => {
    return new Promise((resolve, reject) => {
      // Retry the request until there is at least one request remaining
      pendingRequests++
      console.debug('Pending requests:', pendingRequests)
      let interval = setInterval(() => {
        if (rateLimitRemaining > 0 && burstRateRemaining > 0) {
          clearInterval(interval)

          const apiToken =
            getValue(API_TOKEN_KEY, true) ?? getValue(API_TOKEN_KEY)
          if (apiToken) {
            config.headers = {
              ...config.headers,
              Authorization: `Bearer ${apiToken}`,
            }
          }

          pendingRequests--
          console.debug('Pending requests lowered:', pendingRequests)
          rateLimitRemaining--
          console.debug('Rate limit lowered, remaining:', rateLimitRemaining)
          burstRateRemaining--
          console.debug('Burst rate remaining:', burstRateRemaining)

          resolve(config)
          console.debug('*** Request resolved ***')
        }
      }, INTERVAL_MS)
    })
  },
  (error) => Promise.reject(error)
)

// axios response interceptor
axiosInstance.interceptors.response.use(
  async (response) => {
    resetRateLimit(response.headers)
    return response
  },
  async (error) => {
    resetRateLimit(error.response?.headers)
    // Handle rate limit errors
    if (error.response.status === 429) {
      console.error('Rate limit was exceeded.')
    }
    return Promise.reject(error)
  }
)

const resetRateLimit = (headers: AxiosResponseHeaders) => {
  const rateLimitLimitHeader = parseInt(headers['x-ratelimit-limit'])
  if (rateLimitLimitHeader && rateLimitLimitHeader > 0) {
    // Set the rate limit limit to the header value
    rateLimitLimit = rateLimitLimitHeader
  }
  const rateLimitRemainingHeader = parseInt(headers['x-ratelimit-remaining'])
  if (
    rateLimitRemainingHeader &&
    rateLimitRemainingHeader !== rateLimitRemaining
  ) {
    // Set the remaining rate limit to the header value
    rateLimitRemaining = rateLimitRemainingHeader
    console.debug(
      'Rate limit remaining set from header value:',
      rateLimitRemainingHeader
    )
  }
  const retryAfterHeader = parseFloat(headers['retry-after'])
  if (retryAfterHeader && retryAfterHeader > 0) {
    // Top up the rate limit after the retry-after time
    console.warn(`Rate limit reached, retry after ${retryAfterHeader} seconds`)
    setTimeout(() => {
      const remaining = Math.min(rateLimitRemaining + 1, rateLimitLimit)
      rateLimitRemaining = remaining
      console.debug('Rate limit replenished, remaining:', rateLimitRemaining)
    }, retryAfterHeader * INTERVAL_MS)
  }
}

export default axiosInstance
