import { expose } from 'comlink'

let intervalRef: NodeJS.Timer
const timer = {
  start(callback: (value: number) => void, interval = 1000) {
    let counter = 0
    intervalRef = setInterval(() => {
      counter++
      callback(counter)
    }, interval)
  },
  clear() {
    clearInterval(intervalRef)
  },
}

expose(timer)
