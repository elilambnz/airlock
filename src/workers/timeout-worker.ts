import { expose } from 'comlink'

let timeoutRef: NodeJS.Timeout
const timeout = {
  start(callback: () => void, delay: number) {
    timeoutRef = setTimeout(() => {
      callback()
    }, delay)
  },
  clear() {
    clearTimeout(timeoutRef)
  },
}

expose(timeout)
