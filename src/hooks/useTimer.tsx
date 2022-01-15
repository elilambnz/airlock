import React, { createContext, useContext, useState, useEffect } from 'react'

const TimerContext = createContext({
  time: 0,
  reset: () => {},
})

export const TimeProvider = (props: any) => {
  const [time, setTime] = useState(0)
  const run = true

  useEffect(() => {
    if (run === true && time < 1440) {
      var timerID = setInterval(() => tick(time), 1000)

      return function cleanup() {
        clearInterval(timerID)
      }
    }
  }, [run, time])

  const tick = (time: number) => {
    setTime(time + 1)
    console.log(time)
  }

  const reset = () => {
    setTime(0)
  }

  const value = {
    time,
    reset,
  }
  return <TimerContext.Provider value={value} {...props} />
}

export const useTimer = () => useContext(TimerContext)
