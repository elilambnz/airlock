import { expose } from 'comlink'

const obj = {
  start(tick: (value: number) => void) {
    let counter = 0
    setInterval(() => {
      console.debug('tick...')
      counter++
      tick(counter)
    }, 1000)
  },
}

expose(obj)
