import { expose } from 'comlink'

let interval: NodeJS.Timer
const timer = {
  start(callback: (value: number) => void) {
    let counter = 0
    interval = setInterval(() => {
      counter++
      callback(counter)
    }, 1000)
  },
  stop() {
    clearInterval(interval)
  },
}

expose(timer)
