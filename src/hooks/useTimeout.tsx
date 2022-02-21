import { proxy, Remote, wrap } from 'comlink'
import { useMemo } from 'react'

export function useTimeout() {
  const worker = useMemo(
    () => new Worker(new URL('../workers/timeout-worker', import.meta.url)),
    []
  )

  const timeout: Remote<{
    start: (callback: (value: unknown) => void, delay: number) => Promise<void>
    clear: () => void
  }> = wrap(worker)

  const sleep = (ms: number) => {
    return new Promise((resolve) => timeout.start(proxy(resolve), ms))
  }

  const clear = async () => {
    await timeout.clear()
  }

  return { sleep, clear }
}
