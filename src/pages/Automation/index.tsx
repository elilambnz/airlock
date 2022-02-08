import { useState, useEffect, useMemo } from 'react'
import { listMyShips } from '../../api/routes/my'
import { getSystemLocations } from '../../api/routes/systems'
import { listGoodTypes } from '../../api/routes/types'
import '../../App.css'
import AlertModal from '../../components/Modal/AlertModal'
import Modal from '../../components/Modal/index'
import Select from '../../components/Select'
import useAutomation from '../../hooks/useAutomation'
import {
  RouteEventType,
  TradeRoute,
  TradeRouteEvent,
  TradeRouteStatus,
} from '../../types/Automation'
import { ListSystemLocationsResponse } from '../../types/System'
import { GoodType, ListGoodTypesResponse } from '../../types/Order'
import { ListShipsResponse } from '../../types/Ship'
import moment from 'moment'
import 'moment-duration-format'
import { AutomationStatus } from '../../providers/AutomationProvider'
import RouteSteps from './components/RouteSteps'
import AssignedShips from './components/AssignedShips'
import Alert from '../../components/Alert'
import { getLocationMarketplace } from '../../api/routes/locations'
import { LocationMarketplaceResponse } from '../../types/Location'
import { InformationCircleIcon } from '@heroicons/react/solid'

const STARTER_SYSTEM = 'OE'

function Automation() {
  const [showInfo, setShowInfo] = useState(false)
  const [myShips, setMyShips] = useState<ListShipsResponse>()
  const [marketplaceLocation, setMarketplaceLocation] = useState<string>()
  const [currentSystem, setCurrentSystem] = useState<string>()
  const [availableLocations, setAvailableLocations] =
    useState<ListSystemLocationsResponse>()
  const [goodTypes, setGoodTypes] = useState<ListGoodTypesResponse>()
  const [availableGoods, setAvailableGoods] =
    useState<LocationMarketplaceResponse>()

  const [newTradeRoute, setNewTradeRoute] = useState<TradeRoute>({
    _version: 0,
    id: '',
    events: [],
    assignedShips: [],
    autoRefuel: true,
    status: TradeRouteStatus.ACTIVE,
  })
  const [newTradeRouteLocation, setNewTradeRouteLocation] =
    useState<TradeRouteEvent>({
      type: RouteEventType.TRAVEL,
      location: '',
    })
  const [newTradeRouteTrade, setNewTradeRouteTrade] = useState<TradeRouteEvent>(
    {
      type: RouteEventType.BUY,
      good: {
        good: '',
        quantity: 0,
      },
    }
  )
  const [newTradeRouteShip, setNewTradeRouteShip] = useState('')
  const [routeToManage, setRouteToManage] = useState<TradeRoute>()

  const {
    status,
    runTime,
    tradeRoutes,
    tradeRouteLog,
    addTradeRoute,
    removeTradeRoute,
    pauseTradeRoute,
    resumeTradeRoute,
    state,
  } = useAutomation()

  useEffect(() => {
    const init = async () => {
      setMyShips(await listMyShips())
      setGoodTypes(await listGoodTypes())
    }
    init()
  }, [])

  const shipOptions =
    myShips?.ships
      .filter(
        (s) =>
          !tradeRoutes
            .reduce(
              (acc: string[], cur) => [...acc, cur.assignedShips].flat(),
              []
            )
            .includes(s.id)
      )
      ?.map((ship) => ({
        value: ship.id,
        label: `${ship.type} (${ship.maxCargo - ship.spaceAvailable}/${
          ship.maxCargo
        }) [${
          ship.cargo.find((cargo) => cargo.good === GoodType.FUEL)?.quantity ??
          0
        }] ${ship.location}`,
      })) ?? []

  const knownSystems = useMemo(() => {
    return new Set([
      STARTER_SYSTEM,
      ...(myShips?.ships.map((s) => s.location?.split('-')[0]) ?? []),
    ])
  }, [myShips?.ships])

  const knownSystemOptions: { value: string; label: string }[] = [
    ...knownSystems,
  ].map((s) => ({
    value: s!,
    label: s!,
  }))

  useEffect(() => {
    if (!currentSystem && [...knownSystems].length > 0) {
      setCurrentSystem([...knownSystems][0])
    }
  }, [currentSystem, knownSystems])

  useEffect(() => {
    if (currentSystem) {
      const updateLocations = async () => {
        try {
          setAvailableLocations(undefined)
          setAvailableLocations(await getSystemLocations(currentSystem))
        } catch (error) {
          console.error('Error getting locations', error)
        }
      }
      updateLocations()
    }
  }, [currentSystem])

  useEffect(() => {
    const travelEvents = newTradeRoute.events.filter(
      (e) => e.type === RouteEventType.TRAVEL
    )
    const lastTravelEvent = travelEvents[travelEvents.length - 1]
    if (currentSystem && lastTravelEvent) {
      setMarketplaceLocation(lastTravelEvent.location)
    }
  }, [currentSystem, newTradeRoute])

  useEffect(() => {
    if (marketplaceLocation) {
      const updateGoods = async () => {
        try {
          setAvailableGoods(undefined)
          setAvailableGoods(await getLocationMarketplace(marketplaceLocation))
        } catch (error) {
          console.error('Error getting goods', error)
        }
      }
      updateGoods()
    }
  }, [marketplaceLocation])

  const locationOptions =
    availableLocations?.locations.map((l) => ({
      value: l.symbol,
      label: `${l.name} (${l.symbol})`,
    })) ?? []

  const goodOptions =
    goodTypes?.goods.map((g) => {
      const availableGood = availableGoods?.marketplace.find((m) => {
        return m.symbol === g.symbol
      })
      return {
        value: g.symbol,
        label: `${g.name} ${
          availableGood
            ? `(${
                newTradeRouteTrade.type === RouteEventType.BUY
                  ? `Buy: ${availableGood.purchasePricePerUnit}`
                  : RouteEventType.SELL
                  ? `Sell: ${availableGood.sellPricePerUnit}`
                  : 0
              })`
            : ''
        }`,
      }
    }) ?? []

  const addGoodToTradeRouteDisabled = !(
    newTradeRoute.events.filter((e) => e.type === RouteEventType.TRAVEL)
      .length > 0
  )

  const handleSaveTradeRoute = async () => {
    try {
      await addTradeRoute(newTradeRoute)
      setNewTradeRoute({
        ...newTradeRoute,
        events: [],
        assignedShips: [],
      })
    } catch (error) {
      console.error('Error adding trade route', error)
    }
  }

  const handleRemoveTradeRoute = async (id: string, version: number) => {
    try {
      await removeTradeRoute(id, version)
    } catch (error) {
      console.error('Error removing trade route', error)
    }
  }

  return (
    <>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-gray-900">Automation</h1>
            <button
              className="text-gray-900 hover:text-gray-600 focus:outline-none focus:text-gray-600 ml-4"
              onClick={() => setShowInfo(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>
      <main>
        <div className="bg-gray-100 min-h-screen">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div>
              <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Status
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      <span
                        className={
                          'inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium' +
                          (status === AutomationStatus.Running
                            ? ' bg-green-100 text-green-800'
                            : status === AutomationStatus.Stopped
                            ? ' bg-red-100 text-red-800'
                            : '')
                        }
                      >
                        {status}
                      </span>
                    </dd>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Run Time
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {moment.duration(runTime, 'seconds').format('HH:mm:ss')}
                    </dd>
                    <p>Worker: {state}</p>
                    <p>
                      Drift:{' '}
                      <span className="text-red-600">{state - runTime}</span>
                    </p>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Tasks
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {tradeRoutes.length}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            <div className="max-w-7xl mx-auto py-6">
              <h2 className="text-2xl font-bold text-gray-900">Trading</h2>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Create New Route
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Plan automated trade routes for your fleet.
                </p>
              </div>
              <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg"></div>
                    <div className="mt-4 px-6">
                      <h4 className="text-md leading-6 font-medium text-gray-900">
                        Add Step
                      </h4>
                    </div>
                    <form className="min-w-full divide-y divide-gray-200">
                      <div className="p-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-2">
                          <Select
                            label="Select Destination System"
                            options={knownSystemOptions}
                            value={currentSystem}
                            onChange={(value) => {
                              setCurrentSystem(value)
                            }}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Select
                            label="Select Destination Location"
                            options={locationOptions}
                            value={newTradeRouteLocation.location}
                            onChange={(value) => {
                              setNewTradeRouteLocation((prev) => ({
                                ...prev,
                                location: value,
                              }))
                            }}
                          />
                        </div>
                        <div className="sm:col-span-1 pt-6">
                          <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={(e) => {
                              e.preventDefault()
                              if (!newTradeRoute || !newTradeRouteLocation) {
                                return
                              }
                              setNewTradeRoute((prev) => ({
                                ...prev,
                                events: [...prev.events, newTradeRouteLocation],
                              }))
                              if (
                                newTradeRouteLocation.location?.split(
                                  '-'
                                )[1] === 'W'
                              ) {
                                setNewTradeRoute((prev) => ({
                                  ...prev,
                                  events: [
                                    ...prev.events,
                                    {
                                      type: RouteEventType.WARP_JUMP,
                                    },
                                  ],
                                }))
                              }
                            }}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </form>

                    <form className="min-w-full divide-y divide-gray-200">
                      <div className="p-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-2">
                          <Select
                            label="Select Good"
                            options={goodOptions}
                            value={newTradeRouteTrade.good?.good}
                            onChange={(value) => {
                              setNewTradeRouteTrade((prev) => ({
                                ...prev,
                                good: {
                                  ...prev.good,
                                  good: value,
                                  quantity: prev.good?.quantity || 1,
                                },
                              }))
                            }}
                          />
                        </div>
                        <div className="sm:col-span-1">
                          <label
                            htmlFor="quantity"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Quantity
                          </label>
                          <input
                            id="quantity"
                            className="mt-1 block w-full py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            type="number"
                            onChange={(e) => {
                              e.preventDefault()
                              setNewTradeRouteTrade((prev) => ({
                                ...prev,
                                good: {
                                  ...prev.good,
                                  good: prev.good?.good || '',
                                  quantity: parseInt(e.target.value),
                                },
                              }))
                            }}
                          />
                        </div>
                        <div className="sm:col-span-1">
                          <Select
                            label="Action"
                            options={[
                              {
                                value: RouteEventType.BUY,
                                label: 'Buy',
                              },
                              {
                                value: RouteEventType.SELL,
                                label: 'Sell',
                              },
                            ]}
                            value={newTradeRouteTrade?.type}
                            onChange={(value) => {
                              setNewTradeRouteTrade((prev) => ({
                                ...prev,
                                type: value as RouteEventType,
                              }))
                            }}
                          />
                        </div>
                        <div className="sm:col-span-2 pt-6">
                          <button
                            type="submit"
                            className={
                              'inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' +
                              (addGoodToTradeRouteDisabled
                                ? ' opacity-50 cursor-not-allowed'
                                : '')
                            }
                            disabled={addGoodToTradeRouteDisabled}
                            onClick={(e) => {
                              e.preventDefault()
                              if (!newTradeRoute || !newTradeRouteTrade) {
                                return
                              }
                              setNewTradeRoute((prev) => ({
                                ...prev,
                                events: [...prev.events, newTradeRouteTrade],
                              }))
                            }}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </form>

                    <RouteSteps
                      tradeRoute={newTradeRoute}
                      setTradeRoute={setNewTradeRoute}
                    />

                    <div className="mt-4 px-6">
                      <h4 className="text-md leading-6 font-medium text-gray-700">
                        Assign Ships
                      </h4>
                    </div>
                    <div className="mt-4 px-6 flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="autoRefuel"
                          name="autoRefuel"
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          onChange={(e) => {
                            setNewTradeRoute((prev) => ({
                              ...prev,
                              autoRefuel: e.target.checked,
                            }))
                          }}
                        />
                        <label
                          htmlFor="autoRefuel"
                          className="ml-2 block text-sm text-gray-900"
                        >
                          Auto Refuel
                        </label>
                      </div>
                    </div>
                    <form className="min-w-full divide-y divide-gray-200">
                      <div className="p-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-2">
                          <Select
                            label="Select Ship"
                            options={shipOptions.filter(
                              (s) =>
                                !newTradeRoute.assignedShips.includes(s.value)
                            )}
                            value={newTradeRouteShip}
                            onChange={(value) => {
                              setNewTradeRouteShip(value)
                            }}
                          />
                        </div>
                        <div className="sm:col-span-2 pt-6">
                          <button
                            type="submit"
                            className={
                              'inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' +
                              (!newTradeRouteShip
                                ? ' opacity-50 cursor-not-allowed'
                                : '')
                            }
                            disabled={!newTradeRouteShip}
                            onClick={(e) => {
                              e.preventDefault()
                              if (!newTradeRoute || !newTradeRouteShip) {
                                return
                              }
                              setNewTradeRoute((prev) => ({
                                ...prev,
                                assignedShips: [
                                  ...prev.assignedShips,
                                  newTradeRouteShip,
                                ],
                              }))
                            }}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </form>

                    <AssignedShips
                      tradeRoute={newTradeRoute}
                      setTradeRoute={setNewTradeRoute}
                    />

                    <div className="p-6">
                      <button
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => {
                          handleSaveTradeRoute()
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Trading Routes
                </h3>
              </div>
              <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Locations
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Goods
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Assigned Ships
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Auto Refuel
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Status
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {tradeRoutes.length > 0 ? (
                            tradeRoutes.map((route, i) => (
                              <tr
                                key={i}
                                className={
                                  i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                }
                              >
                                <td className="px-6 py-4 text-sm leading-5 font-medium text-gray-900">
                                  {route.events
                                    .filter(
                                      (e) => e.type === RouteEventType.TRAVEL
                                    )
                                    ?.reduce(
                                      (acc: string[], cur) => [
                                        ...acc,
                                        String(cur.location),
                                      ],
                                      []
                                    )
                                    .join(' → ')}
                                </td>
                                <td className="px-6 py-4 text-sm leading-5 text-gray-500">
                                  {[
                                    ...new Set(
                                      route.events
                                        .filter(
                                          (e) =>
                                            e.type === RouteEventType.BUY ||
                                            e.type === RouteEventType.SELL
                                        )
                                        ?.reduce(
                                          (acc: string[], cur) => [
                                            ...acc,
                                            String(cur.good?.good),
                                          ],
                                          []
                                        )
                                    ),
                                  ].join(', ')}
                                </td>
                                <td className="px-6 py-4 text-sm leading-5 text-gray-500">
                                  {route.assignedShips.join(', ')}
                                </td>
                                <td className="px-6 py-4 text-sm leading-5 text-gray-500">
                                  {route.autoRefuel ? 'Yes' : 'No'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                  <span
                                    className={
                                      'px-2 inline-flex text-xs leading-5 font-semibold rounded-full' +
                                      (route.status === TradeRouteStatus.ACTIVE
                                        ? ' bg-green-100 text-green-800'
                                        : route.status ===
                                          TradeRouteStatus.PAUSED
                                        ? ' bg-yellow-100 text-yellow-800'
                                        : route.status ===
                                          TradeRouteStatus.ERROR
                                        ? ' bg-red-100 text-red-800'
                                        : '')
                                    }
                                  >
                                    {route.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                  <button
                                    className="text-indigo-600 hover:text-indigo-900"
                                    onClick={() => {
                                      setRouteToManage(route)
                                    }}
                                  >
                                    Manage
                                  </button>
                                  <button
                                    className="ml-4 text-red-600 hover:text-red-900"
                                    onClick={() => {
                                      handleRemoveTradeRoute(
                                        route.id,
                                        route._version
                                      )
                                    }}
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr className="bg-white text-center">
                              <td
                                className="px-6 py-4 text-gray-500"
                                colSpan={6}
                              >
                                No routes available.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <AlertModal
        icon={
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
            <InformationCircleIcon
              className="h-6 w-6 text-indigo-600"
              aria-hidden="true"
            />
          </div>
        }
        open={showInfo}
        title="About automation"
        message={`Automation routes are saved to a secondary database. This means that you can leave the game and when you return, the routes you set will be saved. This browser tab must remain open to run automation routes, but does not have to be focused.\n\nThis feature is not part of, nor endorsed by the official Spacetraders API. To opt out of this feature, you can simply choose to not create any automation routes.`}
        onClose={() => setShowInfo(false)}
        className="w-full md:max-w-xl"
      />
      <Modal
        open={!!routeToManage}
        title="Manage Route"
        content={
          <>
            {routeToManage && (
              <div>
                {tradeRoutes.find((r) => r.id === routeToManage.id)?.status ===
                  TradeRouteStatus.ERROR && (
                  <Alert message={routeToManage.errorMessage} />
                )}
                {tradeRoutes.find((r) => r.id === routeToManage.id)?.status ===
                  TradeRouteStatus.ACTIVE && (
                  <button
                    className="mt-4 text-red-600 hover:text-red-900"
                    onClick={() => {
                      pauseTradeRoute(routeToManage.id)
                    }}
                  >
                    Pause
                  </button>
                )}
                {tradeRoutes.find((r) => r.id === routeToManage.id)?.status !==
                  TradeRouteStatus.ACTIVE && (
                  <button
                    className="mt-4 text-green-600 hover:text-green-900"
                    onClick={() => {
                      resumeTradeRoute(routeToManage.id)
                    }}
                  >
                    Resume from start
                  </button>
                )}
                <div className="mt-4">
                  <h4 className="text-md leading-6 font-medium text-gray-900">
                    Steps
                  </h4>
                </div>
                <RouteSteps
                  tradeRoute={routeToManage}
                  notActive={
                    tradeRoutes.find((r) => r.id === routeToManage.id)
                      ?.status !== TradeRouteStatus.ACTIVE
                  }
                  handleResume={(step: number) => {
                    resumeTradeRoute(routeToManage.id, step)
                  }}
                />
                <div className="mt-4">
                  <h4 className="text-md leading-6 font-medium text-gray-900">
                    Assigned Ships
                  </h4>
                </div>
                <div className="mt-4">
                  Auto Refuel: {routeToManage.autoRefuel ? 'Yes' : 'No'}
                </div>
                <AssignedShips tradeRoute={routeToManage} />
                <details>
                  <summary className="text-md leading-6 font-medium text-gray-900 hover:cursor-pointer">
                    Show log
                  </summary>
                  <div
                    className="bg-gray-900 p-4 rounded-md text-white overflow-auto"
                    style={{ height: '200px' }}
                  >
                    <pre className="text-xs">
                      {tradeRouteLog[routeToManage.id]?.map(
                        (l: string, i: number) => (
                          <p key={i}>{l}</p>
                        )
                      )}
                    </pre>
                  </div>
                </details>
              </div>
            )}
          </>
        }
        closeText="Close"
        onClose={() => setRouteToManage(undefined)}
      />
    </>
  )
}

export default Automation
