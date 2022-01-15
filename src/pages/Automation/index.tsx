import React, { useState, useEffect, useMemo } from 'react'
import { getLocationMarketplace } from '../../api/routes/locations'
import { listMyShips } from '../../api/routes/my'
import { getShipListings } from '../../api/routes/systems'
import { listGoodTypes, listShipTypes } from '../../api/routes/types'
import '../../App.css'
import SimpleModal from '../../components/Modal/SimpleModal'
import SelectMenu from '../../components/SelectMenu'
import {
  RouteEventType,
  TradeRoute,
  TradeRouteEvent,
} from '../../types/Automation'
import { LocationMarketplaceResponse } from '../../types/Location'
import { ListGoodTypesResponse } from '../../types/Order'
import { ListShipsResponse, ListShipTypesResponse } from '../../types/Ship'

const STARTER_SYSTEM = 'OE'

function Automation() {
  const [showInfo, setShowInfo] = useState(false)
  const [myShips, setMyShips] = useState<ListShipsResponse>()
  const [marketplaceLocation, setMarketplaceLocation] = useState<string>()
  const [marketplace, setMarketplace] = useState<LocationMarketplaceResponse>()
  const [marketplaceShipSystem, setMarketplaceShipSystem] = useState<string>()

  const [newTradeRoute, setNewTradeRoute] = useState<TradeRoute>({
    events: [],
    assignedShips: [],
    paused: false,
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
  const [tradeRoutes, setTradeRoutes] = useState<TradeRoute[]>([
    {
      events: [
        {
          type: RouteEventType.BUY,
          good: {
            good: 'FUEL',
            quantity: 20,
          },
        },
        {
          type: RouteEventType.BUY,
          good: {
            good: 'METALS',
            quantity: 80,
          },
        },
        {
          type: RouteEventType.TRAVEL,
          location: 'OE-PM',
        },
        {
          type: RouteEventType.SELL,
          good: {
            good: 'METALS',
            quantity: 80,
          },
        },
        {
          type: RouteEventType.BUY,
          good: {
            good: 'FUEL',
            quantity: 20,
          },
        },
        {
          type: RouteEventType.TRAVEL,
          location: 'OE-PM-TR',
        },
      ],
      assignedShips: ['ship1', 'ship2'],
      paused: false,
    },
  ])

  const [goodTypes, setGoodTypes] = useState<ListGoodTypesResponse>()
  const [shipTypes, setShipTypes] = useState<ListShipTypesResponse>()

  useEffect(() => {
    const init = async () => {
      setMyShips(await listMyShips())
      setGoodTypes(await listGoodTypes())
      setShipTypes(await listShipTypes())
    }
    init()
  }, [])

  console.log('goodTypes', goodTypes)
  console.log('shipTypes', shipTypes)

  const shipOptions = myShips?.ships.map((ship) => ({
    value: ship.id,
    label: `${ship.type} (${ship.maxCargo - ship.spaceAvailable}/${
      ship.maxCargo
    }) [${ship.cargo.find((cargo) => cargo.good === 'FUEL')?.quantity ?? 0}] ${
      ship.location
    }`,
  }))

  const marketplaceLocationOptions: { value: string; label: string }[] =
    useMemo(() => {
      return (
        myShips?.ships
          .filter((s) => !!s.location)
          ?.map((s) => ({
            value: s.location!,
            label: s.location!,
          })) ?? []
      )
    }, [myShips?.ships])

  useEffect(() => {
    if (!marketplaceLocation && marketplaceLocationOptions.length > 0) {
      setMarketplaceLocation(marketplaceLocationOptions[0].value)
    }
  }, [marketplaceLocation, marketplaceLocationOptions])

  useEffect(() => {
    if (marketplaceLocation) {
      const updateMarketplace = async () => {
        setMarketplace(await getLocationMarketplace(marketplaceLocation))
      }
      updateMarketplace()
    }
  }, [marketplaceLocation])

  const knownSystems = new Set([
    STARTER_SYSTEM,
    ...(myShips?.ships.map((s) => s.location?.split('-')[0]) ?? []),
  ])
  const knownSystemOptions: { value: string; label: string }[] = [
    ...knownSystems,
  ].map((s) => ({
    value: s!,
    label: s!,
  }))

  useEffect(() => {
    if (!marketplaceShipSystem && knownSystemOptions.length > 0) {
      setMarketplaceShipSystem(knownSystemOptions[0].value)
    }
  }, [marketplaceShipSystem, knownSystemOptions])

  const getIconForEvent = (event: RouteEventType) => {
    switch (event) {
      case RouteEventType.BUY:
      case RouteEventType.SELL:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
        )
      case RouteEventType.TRAVEL:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        )
    }
  }

  const getColourForEvent = (event: RouteEventType) => {
    switch (event) {
      case RouteEventType.BUY:
        return 'blue'
      case RouteEventType.SELL:
        return 'green'
      case RouteEventType.TRAVEL:
        return 'gray'
      default:
        return 'black'
    }
  }

  const addGoodToTradeRouteDisabled = !(
    newTradeRoute.events.filter((e) => e.type === RouteEventType.TRAVEL)
      .length > 0
  )

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
            <div className="max-w-7xl mx-auto py-6">
              <h2 className="text-2xl font-bold text-gray-900">Trading</h2>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Create New Route
                </h3>
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
                          <SelectMenu
                            label="Select Destination System"
                            options={[
                              {
                                value: STARTER_SYSTEM,
                                label: STARTER_SYSTEM,
                              },
                            ]}
                            onChange={(value) => {}}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <SelectMenu
                            label="Select Destination Location"
                            options={[
                              {
                                value: marketplaceLocation,
                                label: marketplaceLocation,
                              },
                            ]}
                            onChange={(value) => {
                              setNewTradeRouteLocation((prev) => ({
                                ...prev,
                                location: value,
                              }))
                            }}
                          />
                        </div>
                        <div className="sm:col-span-2 pt-6">
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
                          <SelectMenu
                            label="Select Good"
                            options={[
                              {
                                value: 'FUEL',
                                label: 'FUEL',
                              },
                            ]}
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
                          <SelectMenu
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
                            onChange={(value) => {
                              setNewTradeRouteTrade((prev) => ({
                                ...prev,
                                type: RouteEventType[
                                  value.toUpperCase() as keyof typeof RouteEventType
                                ],
                              }))
                            }}
                            defaultValue={RouteEventType.BUY}
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

                    <div className="flow-root p-6 max-w-xl">
                      {newTradeRoute.events.length > 0 ? (
                        <ul className="-mb-8">
                          {newTradeRoute.events.map((event, i) => (
                            <li key={i}>
                              <div className="relative pb-8">
                                {i !== newTradeRoute.events.length - 1 && (
                                  <span
                                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                    aria-hidden="true"
                                  ></span>
                                )}
                                <div className="relative flex space-x-3">
                                  <div>
                                    <span
                                      className={
                                        'h-8 w-8 rounded-full flex items-center justify-center text-white ring-8 ring-white' +
                                        ` bg-${getColourForEvent(
                                          event.type
                                        )}-500`
                                      }
                                    >
                                      {getIconForEvent(event.type)}
                                    </span>
                                  </div>
                                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                    <div>
                                      {event.type === RouteEventType.BUY ? (
                                        <p className="text-sm text-gray-500">
                                          Buy{' '}
                                          <span className="font-medium text-gray-900">
                                            {event.good?.quantity} units
                                          </span>{' '}
                                          of{' '}
                                          <span className="font-medium text-gray-900">
                                            {event.good?.good}
                                          </span>
                                        </p>
                                      ) : event.type === RouteEventType.SELL ? (
                                        <p className="text-sm text-gray-500">
                                          Sell{' '}
                                          <span className="font-medium text-gray-900">
                                            {event.good?.quantity} units
                                          </span>{' '}
                                          of{' '}
                                          <span className="font-medium text-gray-900">
                                            {event.good?.good}
                                          </span>
                                        </p>
                                      ) : event.type ===
                                        RouteEventType.TRAVEL ? (
                                        <p className="text-sm text-gray-500">
                                          Travel to{' '}
                                          <span className="font-medium text-gray-900">
                                            {event.location}
                                          </span>
                                        </p>
                                      ) : (
                                        ''
                                      )}
                                    </div>
                                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                      <button
                                        className="text-red-600 hover:text-red-900"
                                        onClick={(e) => {
                                          e.preventDefault()
                                          setNewTradeRoute((prev) => ({
                                            ...prev,
                                            events: prev.events.filter(
                                              (_, ei) => ei !== i
                                            ),
                                          }))
                                        }}
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">
                          No steps defined. Start by adding either a trade or a
                          travel step.
                        </p>
                      )}
                    </div>

                    <div className="mt-4 px-6">
                      <h4 className="text-md leading-6 font-medium text-gray-900">
                        Assign Ship
                      </h4>
                    </div>
                    <form className="min-w-full divide-y divide-gray-200">
                      <div className="p-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-2">
                          {shipOptions && (
                            <SelectMenu
                              label="Select Ship"
                              options={shipOptions}
                              onChange={(value) => {
                                setNewTradeRoute((prev) => ({
                                  ...prev,
                                  assignedShips: [...prev.assignedShips, value],
                                }))
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </form>

                    <div className="flow-root p-6 max-w-xl">
                      {newTradeRoute.assignedShips.length > 0 ? (
                        newTradeRoute.assignedShips.map((ship, i) => (
                          <div key={i}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <span
                                  className={
                                    'h-8 w-8 rounded-full flex items-center justify-center text-white ring-8 ring-white' +
                                    ` bg-gray-500`
                                  }
                                >
                                  {getIconForEvent(RouteEventType.TRAVEL)}
                                </span>
                                <div className="ml-2">
                                  <p className="text-sm text-gray-900">
                                    {ship}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                <button
                                  className="text-red-600 hover:text-red-900"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    setNewTradeRoute((prev) => ({
                                      ...prev,
                                      assignedShips: prev.assignedShips.filter(
                                        (s) => s !== ship
                                      ),
                                    }))
                                  }}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">
                          No ships assigned.
                        </p>
                      )}
                    </div>

                    <div className="p-6">
                      <button
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => {}}
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 font-medium text-gray-900">
                                  {route.events
                                    .filter(
                                      (e) => e.type === RouteEventType.TRAVEL
                                    )
                                    .reduce(
                                      (acc: string[], cur) => [
                                        ...acc,
                                        String(cur.location),
                                      ],
                                      []
                                    )
                                    .join(' → ')}
                                </td>
                                <td className="px-6 py-4 text-sm leading-5 text-gray-500">
                                  {route.events
                                    .filter(
                                      (e) =>
                                        e.type === RouteEventType.BUY ||
                                        e.type === RouteEventType.SELL
                                    )
                                    .reduce(
                                      (acc: string[], cur) => [
                                        ...acc,
                                        String(cur.good?.good),
                                      ],
                                      []
                                    )
                                    .join(', ')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                  {route.assignedShips.join(', ')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                  {!route.paused ? (
                                    <button
                                      className="text-indigo-600 hover:text-indigo-900"
                                      onClick={() => {}}
                                    >
                                      Pause
                                    </button>
                                  ) : (
                                    <button
                                      className="text-green-600 hover:text-green-900"
                                      onClick={() => {}}
                                    >
                                      Resume
                                    </button>
                                  )}
                                  <button
                                    className="ml-4 text-indigo-600 hover:text-indigo-900"
                                    onClick={() => {}}
                                  >
                                    View Log
                                  </button>
                                  <button
                                    className="ml-4 text-red-600 hover:text-red-900"
                                    onClick={() => {
                                      // removeRoute(route.id)
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
                                colSpan={4}
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
      {showInfo && (
        <SimpleModal
          title="Info"
          content="Automation rules are saved to a secondary database. This means that you can leave the game and come back later and still have the rules you set."
          handleClose={() => setShowInfo(false)}
        />
      )}
    </>
  )
}

export default Automation
