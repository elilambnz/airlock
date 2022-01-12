export const API_TOKEN_KEY = 'al-api-token'

const setValue = (key: string, value: string, persistent = false) => {
  persistent
    ? localStorage.setItem(key, value)
    : sessionStorage.setItem(key, value)
}

const getValue = (key: string, persistent = false) =>
  persistent ? localStorage.getItem(key) : sessionStorage.getItem(key)

const removeValue = (key: string, persistent = false) => {
  persistent ? localStorage.removeItem(key) : sessionStorage.removeItem(key)
}

export { setValue, getValue, removeValue }
