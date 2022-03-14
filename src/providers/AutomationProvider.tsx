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
  initiateWarpJump,
  listMyShips,
} from '../api/routes/my'
import { useAuth } from '../hooks/useAuth'
import {
  RouteEventGood,
  RouteEventStructure,
  RouteEventType,
  TradeRoute,
  TradeRouteStatus,
} from '../types/Automation'
import { getErrorMessage, getShipName } from '../utils/helpers'
import { deposit, purchase, refuel, sell, withdraw } from '../utils/mechanics'

import { useQuery, useQueryClient, UseQueryResult } from 'react-query'
import { NotificationContext, NotificationType } from './NotificationProvider'
import { useTimeout } from '../hooks/useTimeout'
import { useTimer } from '../hooks/useTimer'
import moment, { Moment } from 'moment'

const TIMER_PADDING = 2000 // 2 s

export enum AutomationStatus {
  RUNNING = 'Running',
  STOPPED = 'Stopped',
}

export const AutomationContext = createContext({
  status: AutomationStatus.STOPPED,
  runTime: 0,
  tradeRoutes: {} as UseQueryResult<TradeRoute[], unknown>,
  tradeRouteStatuses: {} as Map<string, TradeRouteStatus>,
  tradeRouteMessages: {} as Map<string, string>,
  tradeRouteProgress: {} as Map<
    string,
    {
      eventIdx: number
      finishesAt?: Moment
    }
  >,
  tradeRouteLog: {} as { [id: string]: string[] },
  addTradeRoute: async (tradeRoute: TradeRoute) => Promise.resolve(),
  updateTradeRoute: async (tradeRoute: TradeRoute) => Promise.resolve(),
  removeTradeRoute: async (id: string, version: number) => Promise.resolve(),
  pauseTradeRoute: (id: string) => {},
  resumeTradeRoute: (id: string, step?: number) => {},
  stopAutomation: () => {},
  startAutomation: () => {},
})

export default function AutomationProvider(props: any) {
  const [status, setStatus] = useState(AutomationStatus.STOPPED)
  const [runTime, setRunTime] = useState(0)

  const [tradeRouteLog, setTradeRouteLog] =
    useState<{ [id: string]: string[] }>()
  const [tradeRouteStatuses, setTradeRouteStatuses] = useState<
    Map<string, TradeRouteStatus>
  >(new Map())
  const [tradeRouteMessages, setTradeRouteMessages] = useState<
    Map<string, string>
  >(new Map())
  const [tradeRouteProgress, setTradeRouteProgress] = useState<
    Map<
      string,
      {
        eventIdx: number
        finishesAt?: Moment
      }
    >
  >(new Map())

  const { push } = useContext(NotificationContext)

  const { start: startTimer, clear: clearTimer } = useTimer()
  const { sleep } = useTimeout()

  const { apiToken } = useAuth()
  const queryClient = useQueryClient()

  const tradeRoutes = useQuery('tradeRoutes', getTradingRoutes, {
    enabled: !!apiToken,
  })
  const myShips = useQuery('myShips', listMyShips)

  useEffect(() => {
    setStatus(
      tradeRouteStatuses.size > 0 &&
        [...tradeRouteStatuses.values()].every(
          (status) => status === TradeRouteStatus.ACTIVE
        )
        ? AutomationStatus.RUNNING
        : AutomationStatus.STOPPED
    )
  }, [tradeRouteStatuses])

  useEffect(() => {
    if (status === AutomationStatus.RUNNING) {
      const init = async () => {
        await startTimer((value) => setRunTime(value))
      }
      init()

      push({
        title: 'Automation started',
        message: `${tradeRoutes.data?.length} trade route${
          (tradeRoutes.data?.length ?? 0) > 1 ? 's are' : ' is'
        } running`,
        type: NotificationType.INFO,
      })
    }

    if (status === AutomationStatus.STOPPED) {
      const clear = async () => {
        await clearTimer()
      }
      clear()
      setRunTime(0)

      if (tradeRouteStatuses.size > 0) {
        push({
          title: 'Automation stopped',
          message: 'All trade routes have been stopped',
          type: NotificationType.INFO,
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  // Start automation tasks
  useEffect(() => {
    tradeRoutes.data?.forEach((route) => {
      setTradeRouteStatuses(
        (prev) => new Map(prev.set(route.id, TradeRouteStatus.ACTIVE))
      )
    })
  }, [tradeRoutes.data])

  // Stop automation tasks
  const stopAutomation = async () => {
    setTradeRouteStatuses(
      (prev) =>
        new Map([...prev.keys()].map((key) => [key, TradeRouteStatus.PAUSED]))
    )
  }

  // Start automation tasks
  const startAutomation = async () => {
    setTradeRouteStatuses(
      (prev) =>
        new Map([...prev.keys()].map((key) => [key, TradeRouteStatus.ACTIVE]))
    )
  }

  const routeShouldContinue = (id: string): boolean => {
    const routeStatus = tradeRouteStatuses.get(id)
    return (
      routeStatus === TradeRouteStatus.ACTIVE &&
      status === AutomationStatus.RUNNING
    )
  }

  const handleLog = (
    routeIdx: number,
    eventIdx: number | null,
    id: string,
    message: string
  ) => {
    console.info(
      `Automation ${routeIdx}${eventIdx !== null ? ` - ${eventIdx}` : ''}:`,
      message
    )
    setTradeRouteLog((prev) => ({
      ...prev,
      [id]: [...(prev?.[id] || []), message],
    }))
  }

  const handleBuy = async (event: RouteEventGood, shipIds: string[]) => {
    await Promise.all(
      shipIds.map(async (id) => {
        const ship = myShips.data?.ships.find((ship) => ship.id === id)
        if (!ship) {
          throw new Error(`Ship ${id} not found`)
        }
        const { good, quantity } = event
        await purchase(ship, good, quantity)
      })
    )
    queryClient.invalidateQueries('user')
  }

  const handleSell = async (event: RouteEventGood, shipIds: string[]) => {
    await Promise.all(
      shipIds.map(async (id) => {
        const ship = myShips.data?.ships.find((ship) => ship.id === id)
        if (!ship) {
          throw new Error(`Ship ${id} not found`)
        }
        const { good, quantity } = event
        await sell(ship, good, quantity)
      })
    )
    queryClient.invalidateQueries('user')
  }

  const handleTravel = async (
    event: {
      eventId: string
      eventIdx: number
    },
    location: string,
    allLocations: string[],
    shipIds: string[],
    autoRefuel: boolean,
    log: (message: string) => void
  ) => {
    log(`Traveling to ${location}`)
    let timeRemaining = [0]
    await Promise.all(
      shipIds.map(async (id) => {
        const ship = myShips.data?.ships.find((ship) => ship.id === id)
        if (!ship) {
          throw new Error(`Ship ${id} not found`)
        }

        try {
          const existingFlightPlan = ship.flightPlanId
            ? (await getFlightPlanInfo(ship.flightPlanId)).flightPlan
            : null

          // Check if the ship is already in transit
          if (existingFlightPlan && existingFlightPlan.terminatedAt === null) {
            if (existingFlightPlan.destination === location) {
              // Ship is already going to the destination
              timeRemaining.push(existingFlightPlan.timeRemainingInSeconds)
              return
            } else {
              // Ship is not traveling to the correct location
              // If there are more than one travel events, we need to check if the ship is already traveling to another location in the route
              if (
                allLocations.length > 1 &&
                allLocations.includes(existingFlightPlan.destination)
              ) {
                // The ship is already traveling to another location in the route, so we don't need to move the ship
                log(
                  `Ship ${getShipName(
                    ship.id
                  )} is already traveling to another location in the route, ${
                    existingFlightPlan.destination
                  }`
                )
                return
              }
              throw new Error(
                `Ship ${getShipName(
                  ship.id
                )} is not traveling to a destination in the route`
              )
            }
          }
        } catch (error: any) {
          console.info('Error checking existing flight plan', error)
        }

        async function createFlightPlan(shipId: string, location: string) {
          const result = await createNewFlightPlan(shipId, location)
          queryClient.invalidateQueries('myShips')
          timeRemaining.push(result.flightPlan.timeRemainingInSeconds)
        }

        // If ship not in transit, create a new flight plan
        if (ship.location !== location) {
          try {
            await createFlightPlan(ship.id, location)
            return
          } catch (error: any) {
            if (error.code === 3001 && autoRefuel) {
              // Insufficient fuel, auto refuel
              await refuel(ship, parseInt(error.message.match(/\d+/g)[0]))
              queryClient.invalidateQueries('user')
              // Retry create new flight plan
              await createFlightPlan(ship.id, location)
              return
            } else {
              throw error
            }
          }
        }

        // Ship is already at event.location
        log(`Ship ${getShipName(ship.id)} is already at ${location}`)
      })
    )

    // Wait for all ships to arrive at location
    const maxTime = Math.max(...timeRemaining) * 1000
    if (maxTime > 0) {
      const { eventId, eventIdx } = event
      setTradeRouteProgress((prev) =>
        prev.set(eventId, { eventIdx, finishesAt: moment().add(maxTime, 'ms') })
      )

      log(`Waiting ${maxTime / 1000}s for all ships to arrive at ${location}`)
      await sleep(maxTime + TIMER_PADDING)
      log(`All ships have arrived at ${location}`)
    }
  }

  const handleWarpJump = async (
    shipIds: string[],
    log: (message: string) => void
  ) => {
    let timeRemaining = [0]
    await Promise.all(
      shipIds.map(async (id) => {
        const result = await initiateWarpJump(id)
        timeRemaining.push(result.flightPlan.timeRemainingInSeconds)
      })
    )
    // Wait for all ships to arrive at location
    const maxTime = Math.max(...timeRemaining) * 1000
    if (maxTime > 0) {
      log(`Waiting ${maxTime / 1000}s for all ships to warp jump`)
      await sleep(maxTime + TIMER_PADDING)
      log('All ships have finished warp jump')
    }
  }

  const handleWithdraw = async (
    event: RouteEventStructure,
    shipIds: string[]
  ) => {
    await Promise.all(
      shipIds.map(async (id) => {
        const ship = myShips.data?.ships.find((ship) => ship.id === id)
        if (!ship) {
          throw new Error(`Ship ${id} not found`)
        }
        const { structure, good, quantity } = event
        await withdraw(structure, ship, good, quantity)
      })
    )
  }

  const handleDeposit = async (
    event: RouteEventStructure,
    shipIds: string[]
  ) => {
    await Promise.all(
      shipIds.map(async (id) => {
        const ship = myShips.data?.ships.find((ship) => ship.id === id)
        if (!ship) {
          throw new Error(`Ship ${id} not found`)
        }
        const { structure, good, quantity } = event
        await deposit(structure, ship, good, quantity)
      })
    )
  }

  useEffect(() => {
    if (tradeRoutes.data && status === AutomationStatus.RUNNING) {
      const run = async () => {
        // Run all trade routes in parallel
        await Promise.all(
          tradeRoutes.data.map(async (route, routeIdx) => {
            const { id, events, assignedShips, autoRefuel } = route

            for (let eventIdx = 0; eventIdx < events.length; eventIdx++) {
              setTradeRouteProgress((prev) => prev.set(id, { eventIdx }))
              const event = events[eventIdx]

              if (!routeShouldContinue(id)) {
                handleLog(
                  routeIdx,
                  null,
                  id,
                  `Route has been stopped by user, skipping remaining events`
                )
                return
              }

              const { type, good, location, structure } = event

              try {
                switch (type) {
                  case RouteEventType.BUY: {
                    if (!good) {
                      throw new Error(`No good specified for event ${eventIdx}`)
                    }
                    await handleBuy(good, assignedShips)
                    handleLog(
                      routeIdx,
                      eventIdx,
                      id,
                      `Bought ${good.quantity} ${good.good}`
                    )
                    break
                  }
                  case RouteEventType.SELL: {
                    if (!good) {
                      throw new Error(`No good specified for event ${eventIdx}`)
                    }
                    await handleSell(good, assignedShips)
                    handleLog(
                      routeIdx,
                      eventIdx,
                      id,
                      `Sold ${good.quantity} ${good.good}`
                    )
                    break
                  }
                  case RouteEventType.TRAVEL: {
                    if (!location) {
                      throw new Error(
                        `No location specified for event ${eventIdx}`
                      )
                    }
                    await handleTravel(
                      {
                        eventId: id,
                        eventIdx,
                      },
                      location,
                      events
                        .filter((e) => e.type === RouteEventType.TRAVEL)
                        .map((e) => e.location)
                        .filter(Boolean) as string[],
                      assignedShips,
                      autoRefuel,
                      (message) => handleLog(routeIdx, eventIdx, id, message)
                    )
                    break
                  }
                  case RouteEventType.WARP_JUMP: {
                    await handleWarpJump(assignedShips, (message) =>
                      handleLog(routeIdx, eventIdx, id, message)
                    )
                    break
                  }
                  case RouteEventType.WITHDRAW: {
                    if (!structure) {
                      throw new Error(
                        `No structure specified for event ${eventIdx}`
                      )
                    }
                    await handleWithdraw(structure, assignedShips)
                    handleLog(
                      routeIdx,
                      eventIdx,
                      id,
                      `Withdrew ${structure.quantity} ${structure.good}`
                    )
                    break
                  }
                  case RouteEventType.DEPOSIT: {
                    if (!structure) {
                      throw new Error(
                        `No structure specified for event ${eventIdx}`
                      )
                    }
                    await handleDeposit(structure, assignedShips)
                    handleLog(
                      routeIdx,
                      eventIdx,
                      id,
                      `Deposited ${structure.quantity} ${structure.good}`
                    )
                    break
                  }
                }
              } catch (error: any) {
                handleLog(
                  routeIdx,
                  eventIdx,
                  id,
                  `Error: ${getErrorMessage(error)}`
                )
                setTradeRouteMessages(
                  (prev) => new Map(prev.set(id, getErrorMessage(error)))
                )
              }

              // If we've reached the last event, restart the route
              if (eventIdx === events.length - 1) {
                handleLog(routeIdx, eventIdx, id, `Route completed. Restarting`)
                eventIdx = -1
              }
            }
          })
        )
      }
      run()
    }

    return () => {
      if (status === AutomationStatus.RUNNING) {
        stopAutomation()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, tradeRoutes.data])

  const addTradeRoute = async (tradeRoute: TradeRoute) => {
    try {
      await createTradingRoute(
        tradeRoute.events,
        tradeRoute.assignedShips,
        tradeRoute.autoRefuel
      )
      queryClient.invalidateQueries('tradeRoutes')
    } catch (error) {
      console.error('Error creating trade route:', error)
    }
  }

  const updateTradeRoute = async (tradeRoute: TradeRoute) => {
    try {
      await updateTradingRoute(
        tradeRoute.id,
        tradeRoute._version,
        tradeRoute.events,
        tradeRoute.assignedShips,
        tradeRoute.autoRefuel
      )
      queryClient.invalidateQueries('tradeRoutes')
    } catch (error) {
      console.error('Error updating trade route:', error)
    }
  }

  const removeTradeRoute = async (id: string, version: number) => {
    try {
      await removeTradingRoute(id, version)
      queryClient.invalidateQueries('tradeRoutes')
    } catch (error) {
      console.error('Error removing trade route:', error)
    }
  }

  const updateTradeRouteStatus = (
    id: string,
    status: TradeRouteStatus,
    message?: string
  ) => {
    if (message) {
      setTradeRouteMessages((prev) => new Map(prev.set(id, message)))
    }
    setTradeRouteStatuses((prev) => new Map(prev.set(id, status)))
  }

  const pauseTradeRoute = async (id: string) => {
    updateTradeRouteStatus(id, TradeRouteStatus.PAUSED)
  }

  const resumeTradeRoute = async (id: string, step?: number) => {
    if (step !== undefined) {
      console.error('resumeTradeRoute: step not implemented yet')
    }
    updateTradeRouteStatus(id, TradeRouteStatus.ACTIVE)
  }

  const value = {
    status,
    runTime,
    tradeRoutes,
    tradeRouteStatuses,
    tradeRouteMessages,
    tradeRouteProgress,
    tradeRouteLog,
    addTradeRoute,
    updateTradeRoute,
    removeTradeRoute,
    pauseTradeRoute,
    resumeTradeRoute,
    stopAutomation,
    startAutomation,
  }
  return <AutomationContext.Provider value={value} {...props} />
}
