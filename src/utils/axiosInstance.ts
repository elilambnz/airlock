import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
})

axiosInstance.interceptors.request.use(
  (config) => {
    const apiToken =
      localStorage.getItem('al-api-token') ??
      sessionStorage.getItem('al-api-token')

    config.headers = { ...config.headers, Authorization: `Bearer ${apiToken}` }
    return config
  },
  (error) => Promise.reject(error)
)

export default axiosInstance
