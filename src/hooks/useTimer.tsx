import { proxy, Remote, wrap } from 'comlink'
import { useMemo } from 'react'

export function useTimer() {
  const worker = useMemo(
    () => new Worker(new URL('../workers/timer-worker', import.meta.url)),
    []
  )

  const timer: Remote<{
    start: (callback: (value: number) => void, interval?: number) => void
    clear: () => void
  }> = wrap(worker)

  const start = (callback: (value: number) => void, interval?: number) => {
    return timer.start(
      proxy((value) => callback(value)),
      interval
    )
  }

  const clear = async () => {
    await timer.clear()
  }

  return { start, clear }
}
