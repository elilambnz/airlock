import { useState, useEffect, createContext, useContext } from 'react'
import {
  getTradingRoutes,
  createTradingRoute,
  removeTradingRoute,
  updateTradingRoute,
} from '../api/routes/auxiliary'
import {
  createNewFlightPlan,
  getFlightPlanInfo,
  getShipInfo,
  initiateWarpJump,
} from '../api/routes/my'
import { useAuth } from '../hooks/useAuth'
import {
  RouteEventType,
  TradeRoute,
  TradeRouteStatus,
} from '../types/Automation'
import { GoodType } from '../types/Order'
import { getShipName } from '../utils/helpers'
import { purchase, refuel, sell } from '../utils/mechanics'

import { useQuery, useQueryClient, UseQueryResult } from 'react-query'
import { NotificationContext, NotificationType } from './NotificationProvider'
import { useTimeout } from '../hooks/useTimeout'
import { useTimer } from '../hooks/useTimer'

export enum AutomationStatus {
  Running = 'Running',
  Stopped = 'Stopped',
}

export const AutomationContext = createContext({
  status: AutomationStatus.Stopped,
  runTime: 0,
  tradeRoutes: {} as UseQueryResult<TradeRoute[], unknown>,
  tradeRouteLog: {} as { [id: string]: string[] },
  setStatus: (status: AutomationStatus) => {},
  addTradeRoute: async (tradeRoute: TradeRoute) => Promise.resolve(),
  updateTradeRoute: async (tradeRoute: TradeRoute) => Promise.resolve(),
  removeTradeRoute: async (id: string, version: number) => Promise.resolve(),
  pauseTradeRoute: (id: string) => {},
  resumeTradeRoute: (id: string, step?: number) => {},
})

export default function AutomationProvider(props: any) {
  const [status, setStatus] = useState(AutomationStatus.Stopped)
  const [runTime, setRunTime] = useState(0)
  const [tradeRouteLog, setTradeRouteLog] =
    useState<{ [id: string]: string[] }>()

  const { push } = useContext(NotificationContext)

  const { start: startTimer, clear: clearTimer } = useTimer()
  const { sleep } = useTimeout()

  const { apiToken } = useAuth()
  const queryClient = useQueryClient()

  const tradeRoutes = useQuery('tradeRoutes', getTradingRoutes, {
    enabled: !!apiToken,
  })

  useEffect(() => {
    if (status === AutomationStatus.Running) {
      const init = async () => {
        await startTimer((value) => setRunTime(value))
      }
      init()
    }

    if (status === AutomationStatus.Stopped) {
      const clear = async () => {
        await clearTimer()
      }
      clear()
      setRunTime(0)
    }
  }, [status])

  const start = () => {
    if (status === AutomationStatus.Running) {
      return
    }
    push({
      title: 'Automation started',
      message: `${tradeRoutes.data?.length} trade route${
        (tradeRoutes.data?.length ?? 0) > 1 ? 's are' : ' is'
      } running`,
      type: NotificationType.INFO,
    })
    setStatus(AutomationStatus.Running)
  }

  const stop = () => {
    if (status === AutomationStatus.Stopped) {
      return
    }
    push({
      title: 'Automation stopped',
      message: 'All trade routes have been stopped',
      type: NotificationType.INFO,
    })
    setStatus(AutomationStatus.Stopped)
  }

  // Start automation tasks
  useEffect(() => {
    if (tradeRoutes.data) {
      if (tradeRoutes.data.length > 0) {
        start()
        console.info(`Automation: Trade routes: ${tradeRoutes.data.length}`)
        tradeRoutes.data.forEach((tradeRoute, i) => {
          addTradeRouteLog(
            i,
            tradeRoute.id,
            `Automating trade route. Events: ${tradeRoute.events.length}`
          )
          automateTradeRoute(tradeRoute, i)
        })
      } else {
        stop()
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tradeRoutes.data])

  const addTradeRouteLog = (taskIndex: number, id: string, message: string) => {
    console.info(`Automation ${taskIndex}:`, message)
    setTradeRouteLog((prev) => ({
      ...prev,
      [id]: [...(prev?.[id] || []), message],
    }))
  }

  const automateTradeRoute = async (
    tradeRoute: TradeRoute,
    taskIndex: number
  ) => {
    try {
      // for (const event of tradeRoute.events) {
      console.log('startFromStep', tradeRoute.startFromStep ?? 0)

      for (
        let i = tradeRoute.startFromStep ?? 0;
        i < tradeRoute.events.length;
        i++
      ) {
        console.log('*** step', i)

        const event = tradeRoute.events[i]

        try {
          if (event.type === RouteEventType.TRAVEL) {
            if (!event.location) {
              throw new Error('Missing location')
            }
            addTradeRouteLog(
              taskIndex,
              tradeRoute.id,
              `Travel to ${event.location}`
            )
            // Check if the ship is at event.location
            // If not, move the ship to event.location
            let timeRemaining = [0]
            for await (const shipId of tradeRoute.assignedShips) {
              const ship = await getShipInfo(shipId)

              if (ship.ship.flightPlanId) {
                // Ship is already on a flight plan
                const flightPlan = await getFlightPlanInfo(
                  ship.ship.flightPlanId!
                )
                if (flightPlan.flightPlan.destination !== event.location) {
                  // Ship is not traveling to the correct location
                  // There are more than one travel events, so we need to check if the ship is already traveling to another location in the route
                  const nextTravelEventIndex = tradeRoute.events.findIndex(
                    (e) => e.location === flightPlan.flightPlan.destination
                  )
                  console.log('nextTravelEventIndex', nextTravelEventIndex)

                  if (nextTravelEventIndex !== -1) {
                    // The ship is already traveling to another location in the route
                    // So we don't need to move the ship
                    console.warn(
                      'Ship is already traveling to another location in the route',
                      nextTravelEventIndex
                    )
                    // setTradeRoutes((prev) => [
                    //   ...prev.slice(0, taskIndex),
                    //   {
                    //     ...prev[taskIndex],
                    //     startFromStep: nextTravelEventIndex,
                    //   },
                    //   ...prev.slice(taskIndex + 1),
                    // ])
                    break
                  }
                  throw new Error(
                    `Ship ${ship.ship.id} is not traveling to ${event.location}`
                  )
                }
                timeRemaining.push(flightPlan.flightPlan.timeRemainingInSeconds)
                continue
              }
              if (ship.ship.location !== event.location) {
                try {
                  const result = await createNewFlightPlan(
                    shipId,
                    event.location!
                  )
                  timeRemaining.push(result.flightPlan.timeRemainingInSeconds)
                } catch (error: any) {
                  if (error.code === 3001 && tradeRoute.autoRefuel) {
                    // Insufficient fuel, auto refuel
                    await refuel(
                      ship.ship,
                      parseInt(error.message.match(/\d+/g)[0])
                    )
                    queryClient.invalidateQueries('user')
                    // Retry create new flight plan
                    const result = await createNewFlightPlan(
                      shipId,
                      event.location!
                    )
                    timeRemaining.push(result.flightPlan.timeRemainingInSeconds)
                  } else {
                    throw error
                  }
                }
              }
            }
            // Wait for all ships to arrive at event.location
            const maxTime = Math.max(...timeRemaining) * 1000
            addTradeRouteLog(
              taskIndex,
              tradeRoute.id,
              `Waiting for ${maxTime}ms`
            )
            await sleep(maxTime)
          } else if (event.type === RouteEventType.WARP_JUMP) {
            addTradeRouteLog(taskIndex, tradeRoute.id, `Warp jump`)
            // Initiate warp jump for each ship
            let timeRemaining = [0]
            for await (const shipId of tradeRoute.assignedShips) {
              const result = await initiateWarpJump(shipId)
              timeRemaining.push(result.flightPlan.timeRemainingInSeconds)
            }
            // Wait for all ships to complete warp jump
            const maxTime = Math.max(...timeRemaining) * 1000
            addTradeRouteLog(
              taskIndex,
              tradeRoute.id,
              `Waiting for ${maxTime}ms`
            )
            await sleep(maxTime)
          } else if (event.type === RouteEventType.BUY && event.good) {
            if (!event.good || !event.good?.good) {
              throw new Error('Missing good')
            }
            addTradeRouteLog(
              taskIndex,
              tradeRoute.id,
              `Buy ${event.good!.quantity} ${event.good!.good}`
            )
            // Check if the ship has enough cargo space
            // If not, throw an error
            // If so, buy event.good.good for event.good.quantity
            for await (const shipId of tradeRoute.assignedShips) {
              const ship = await getShipInfo(shipId)
              if (ship.ship.spaceAvailable >= event.good!.quantity) {
                await purchase(
                  ship.ship,
                  GoodType[event.good!.good as keyof typeof GoodType],
                  event.good!.quantity
                )
                queryClient.invalidateQueries('user')
              } else {
                if (
                  ship.ship.cargo.find(
                    (cargo) => cargo.good === event.good!.good
                  )?.quantity ??
                  0 >= event.good!.quantity
                ) {
                  // Not throwing an error because the ship already has enough of the good
                  console.warn('Ship already has good in cargo')
                  continue
                }
                throw new Error(
                  `Ship ${getShipName(
                    shipId
                  )} does not have enough space available to buy ${
                    event.good!.quantity
                  } ${event.good!.good}`
                )
              }
            }
          } else if (event.type === RouteEventType.SELL && event.good) {
            if (!event.good || !event.good?.good) {
              throw new Error('Missing good')
            }
            addTradeRouteLog(
              taskIndex,
              tradeRoute.id,
              `Sell ${event.good?.quantity} ${event.good?.good}`
            )
            // Check if the ship has enough quantity of event.good.good
            // If not, throw an error
            // If so, sell event.good.good for event.good.quantity
            for await (const shipId of tradeRoute.assignedShips) {
              const ship = await getShipInfo(shipId)
              if (
                ship.ship.cargo.find((c) => c.good === event.good!.good)
                  ?.quantity ??
                0 >= event.good!.quantity
              ) {
                await sell(
                  ship.ship,
                  GoodType[event.good!.good as keyof typeof GoodType],
                  event.good!.quantity
                )
                queryClient.invalidateQueries('user')
              } else {
                // Not throwing an error here because it's possible that the ship has no goods to sell if it's the first event in the route
                console.warn(
                  `Ship ${getShipName(shipId)} does not have enough ${
                    event.good!.good
                  } to sell ${event.good!.quantity}`
                )
              }
            }
          }
        } catch (error: any) {
          console.error(`IN LOOP - Automation: ${taskIndex} Error:`, error)
          throw error
        }
      }
      // Reset startFromStep
      queryClient.setQueryData(
        'tradeRoutes',
        tradeRoutes.data?.map((r) =>
          r.id === tradeRoute.id
            ? {
                ...r,
                startFromStep: 0,
              }
            : r
        )
      )
      // Repeat indefinitely
      addTradeRouteLog(
        taskIndex,
        tradeRoute.id,
        'Trade route completed. Starting again.'
      )
      automateTradeRoute(tradeRoute, taskIndex)
    } catch (error: any) {
      console.error(`OUT OF LOOP - Automation: ${taskIndex} Error:`, error)
      push({
        title: 'Automation Error',
        message: error.message,
        type: NotificationType.ERROR,
      })
      // Set error status
      queryClient.setQueryData(
        'tradeRoutes',
        tradeRoutes.data?.map((r) =>
          r.id === tradeRoute.id
            ? {
                ...r,
                status: TradeRouteStatus.ERROR,
              }
            : r
        )
      )
    }
  }

  const addTradeRoute = async (tradeRoute: TradeRoute) => {
    try {
      const response = await createTradingRoute(
        tradeRoute.events,
        tradeRoute.assignedShips,
        tradeRoute.autoRefuel
      )
      console.log('addTradeRoute', response)
      queryClient.invalidateQueries('tradeRoutes')
    } catch (error) {
      console.error('Error creating trade route:', error)
    }
  }

  const updateTradeRoute = async (tradeRoute: TradeRoute) => {
    try {
      const response = await updateTradingRoute(
        tradeRoute.id,
        tradeRoute._version,
        tradeRoute.events,
        tradeRoute.assignedShips,
        tradeRoute.autoRefuel
      )
      console.log('updateTradeRoute', response)
      queryClient.invalidateQueries('tradeRoutes')
    } catch (error) {
      console.error('Error updating trade route:', error)
    }
  }

  const removeTradeRoute = async (id: string, version: number) => {
    try {
      const response = await removeTradingRoute(id, version)
      console.log('removeTradeRoute', response)
      queryClient.invalidateQueries('tradeRoutes')
    } catch (error) {
      console.error('Error removing trade route:', error)
    }
  }

  const updateTradeRouteStatus = (id: string, status: TradeRouteStatus) => {
    console.log('updateTradeRouteStatus', id, status)

    queryClient.setQueryData(
      'tradeRoutes',
      tradeRoutes.data?.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
            }
          : r
      )
    )
  }

  const pauseTradeRoute = async (id: string) => {
    updateTradeRouteStatus(id, TradeRouteStatus.PAUSED)
  }

  const resumeTradeRoute = async (id: string, step?: number) => {
    console.log('resumeTradeRoute', id, step)

    queryClient.setQueryData(
      'tradeRoutes',
      tradeRoutes.data?.map((r) =>
        r.id === id
          ? {
              ...r,
              status: TradeRouteStatus.ACTIVE,
              startFromStep: step ?? 0,
            }
          : r
      )
    )
  }

  const value = {
    status,
    runTime,
    tradeRoutes,
    tradeRouteLog,
    setStatus,
    addTradeRoute,
    updateTradeRoute,
    removeTradeRoute,
    pauseTradeRoute,
    resumeTradeRoute,
  }
  return <AutomationContext.Provider value={value} {...props} />
}
