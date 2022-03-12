import { useState, useEffect, createContext, useContext } from 'react'
import {
  getTradingRoutes,
  createTradingRoute,
  removeTradingRoute,
  updateTradingRoute,
} from '../api/routes/auxiliary'
import {
  createNewFlightPlan,
  depositToMyStructure,
  getFlightPlanInfo,
  initiateWarpJump,
  listMyShips,
  withdrawFromMyStructure,
} from '../api/routes/my'
import { useAuth } from '../hooks/useAuth'
import {
  RouteEventGood,
  RouteEventStructure,
  RouteEventType,
  TradeRoute,
  TradeRouteStatus,
} from '../types/Automation'
import { getShipName } from '../utils/helpers'
import { deposit, purchase, refuel, sell, withdraw } from '../utils/mechanics'

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
  tradeRouteStatuses: {} as Map<string, TradeRouteStatus>,
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
  const [status, setStatus] = useState(AutomationStatus.Stopped)
  const [tradeRouteStatuses, setTradeRouteStatuses] = useState<
    Map<string, TradeRouteStatus>
  >(new Map())
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
  const myShips = useQuery('myShips', listMyShips)

  useEffect(() => {
    setStatus(
      tradeRouteStatuses.size > 0 &&
        [...tradeRouteStatuses.values()].every(
          (status) => status === TradeRouteStatus.ACTIVE
        )
        ? AutomationStatus.Running
        : AutomationStatus.Stopped
    )
  }, [tradeRouteStatuses])

  useEffect(() => {
    if (status === AutomationStatus.Running) {
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

    if (status === AutomationStatus.Stopped) {
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
    const status = tradeRouteStatuses.get(id)
    return status === TradeRouteStatus.ACTIVE
  }

  const handleLog = (
    routeIdx: number,
    eventIdx: number,
    id: string,
    message: string
  ) => {
    console.info(`Automation ${routeIdx} - ${eventIdx}:`, message)
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
    location: string,
    allLocations: string[],
    shipIds: string[],
    autoRefuel: boolean,
    log: (message: string) => void
  ) => {
    let timeRemaining = [0]
    await Promise.all(
      shipIds.map(async (id) => {
        const ship = myShips.data?.ships.find((ship) => ship.id === id)
        if (!ship) {
          throw new Error(`Ship ${id} not found`)
        }

        // Check if the ship is already in transit
        if (ship.flightPlanId) {
          // Ship is already on a flight plan
          const flightPlan = await getFlightPlanInfo(ship.flightPlanId)
          if (flightPlan.flightPlan.destination === location) {
            // Ship is already going to the destination
            timeRemaining.push(flightPlan.flightPlan.timeRemainingInSeconds)
            return
          } else {
            // Ship is not traveling to the correct location
            // If there are more than one travel events, we need to check if the ship is already traveling to another location in the route
            if (
              allLocations.length > 1 &&
              allLocations.includes(flightPlan.flightPlan.destination)
            ) {
              // The ship is already traveling to another location in the route, so we don't need to move the ship
              log(
                `Ship ${getShipName(
                  ship.id
                )} is already traveling to another location in the route, ${
                  flightPlan.flightPlan.destination
                }`
              )
              timeRemaining.push(flightPlan.flightPlan.timeRemainingInSeconds)
              return
            }
            throw new Error(
              `Ship ${getShipName(ship.id)} is not traveling to ${location}`
            )
          }
        }

        // If not, move the ship to location
        if (ship.location !== location) {
          try {
            const result = await createNewFlightPlan(ship.id, location)
            timeRemaining.push(result.flightPlan.timeRemainingInSeconds)
            return
          } catch (error: any) {
            if (error.code === 3001 && autoRefuel) {
              // Insufficient fuel, auto refuel
              await refuel(ship, parseInt(error.message.match(/\d+/g)[0]))
              queryClient.invalidateQueries('user')
              // Retry create new flight plan
              const result = await createNewFlightPlan(ship.id, location)
              timeRemaining.push(result.flightPlan.timeRemainingInSeconds)
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
      log(`Waiting ${maxTime / 1000}s for all ships to arrive at ${location}`)
      await sleep(maxTime)
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
      await sleep(maxTime)
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
    if (tradeRoutes.data && status === AutomationStatus.Running) {
      const run = async () => {
        await Promise.all(
          tradeRoutes.data.map(async (route, routeIdx) => {
            const { id, events, assignedShips, autoRefuel } = route

            await Promise.all(
              events.map(async (event, eventIdx) => {
                if (!routeShouldContinue(id)) {
                  return
                }

                const { type, good, location, structure } = event

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
              })
            )
          })
        )
      }
      run()
    }

    return () => {
      if (status === AutomationStatus.Running) {
        stopAutomation()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, tradeRoutes.data])

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
    // update map
    setTradeRouteStatuses((prev) => new Map(prev.set(id, status)))
  }

  const pauseTradeRoute = async (id: string) => {
    updateTradeRouteStatus(id, TradeRouteStatus.PAUSED)
  }

  const resumeTradeRoute = async (id: string, step?: number) => {
    console.log('resumeTradeRoute', id, step)

    updateTradeRouteStatus(id, TradeRouteStatus.ACTIVE)
  }

  const value = {
    status,
    runTime,
    tradeRoutes,
    tradeRouteStatuses,
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
