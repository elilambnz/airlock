import { useState, useEffect, useMemo } from 'react'
import { listMyShips, listMyStructures } from '../../../api/routes/my'
import { getSystemLocations } from '../../../api/routes/systems'
import { listGoodTypes } from '../../../api/routes/types'
import '../../../App.css'
import Select from '../../../components/Select'
import useAutomation from '../../../hooks/useAutomation'
import {
  RouteEventType,
  TradeRoute,
  TradeRouteEvent,
  TradeRouteStatus,
} from '../../../types/Automation'
import RouteSteps from './RouteSteps'
import AssignedShips from './AssignedShips'
import { getLocationMarketplace } from '../../../api/routes/locations'
import {
  getIconForLocationType,
  LocationType,
  System,
} from '../../../types/Location'
import { useQueries, useQuery } from 'react-query'
import 'moment-duration-format'
import { formatNumberCommas, getShipName } from '../../../utils/helpers'
import { StructureCategory } from '../../../types/Structure'

interface RouteConfigurationProps {
  routeToEdit?: TradeRoute
  onUpdate?: () => void
}

export default function RouteConfiguration(props: RouteConfigurationProps) {
  const { routeToEdit, onUpdate } = props

  const [marketplaceLocation, setMarketplaceLocation] = useState<string>()
  const [currentSystem, setCurrentSystem] = useState<string>(System[0])

  const [newTradeRoute, setNewTradeRoute] = useState<TradeRoute>(
    routeToEdit ?? {
      _version: 0,
      id: '',
      events: [],
      assignedShips: [],
      autoRefuel: true,
      status: TradeRouteStatus.ACTIVE,
    }
  )
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
  const [newTradeRouteStructure, setNewTradeRouteStructure] =
    useState<TradeRouteEvent>({
      type: RouteEventType.WITHDRAW,
      structure: {
        structure: '',
        category: '',
        good: '',
        quantity: 0,
      },
    })
  const [newTradeRouteShip, setNewTradeRouteShip] = useState<string>()

  const myShips = useQuery('myShips', listMyShips)
  const allMyStructures = useQuery('myStructures', listMyStructures)
  const goodTypes = useQuery('goodTypes', listGoodTypes)
  const availableGoods = useQuery(
    ['locationMarketplace', marketplaceLocation],
    () => getLocationMarketplace(marketplaceLocation ?? ''),
    {
      enabled: !!marketplaceLocation,
    }
  )

  const knownSystems = useMemo(
    () => [
      ...new Set(
        [
          System[0],
          ...(myShips.data?.ships.map((s) => s.location?.split('-')[0]) ?? []),
        ]
          .filter(Boolean)
          ?.sort(
            (a, b) =>
              Object.keys(System).indexOf(a!) - Object.keys(System).indexOf(b!)
          ) as string[]
      ),
    ],
    [myShips.data?.ships]
  )

  const availableSystems = useQueries(
    knownSystems.map((systemSymbol) => ({
      queryKey: ['systemLocations', systemSymbol],
      queryFn: () => getSystemLocations(systemSymbol),
    })) ?? []
  )

  const availableLocations = useMemo(
    () => availableSystems.flatMap((system) => system.data?.locations) ?? [],
    [availableSystems]
  )

  const { tradeRoutes, addTradeRoute, updateTradeRoute } = useAutomation()

  const knownSystemOptions: { value: string; label: string }[] = [
    ...knownSystems,
  ].map((s) => ({
    value: s!,
    label: s!,
    icon: (
      <div className="flex items-center justify-center w-5 h-5">
        <span className="text-xs">🌌</span>
      </div>
    ),
  }))

  useEffect(() => {
    const travelEvents = newTradeRoute.events.filter(
      (e) => e.type === RouteEventType.TRAVEL
    )
    const lastTravelEvent = travelEvents[travelEvents.length - 1]
    if (currentSystem && lastTravelEvent) {
      setMarketplaceLocation(lastTravelEvent.location)
    }
  }, [currentSystem, newTradeRoute])

  const locationOptions = availableLocations
    .filter((l) => !!l && l.symbol.split('-')[0] === currentSystem)
    ?.sort((a, b) => a!.x - b!.x || a!.y - b!.y)
    .map((l) => ({
      value: l!.symbol,
      label: l!.name,
      tags: [l!.symbol, `(${l!.x}, ${l!.y})`],
      icon: (
        <div className="flex items-center justify-center w-5 h-5">
          <span className="text-xs">
            {getIconForLocationType(
              LocationType[l!.type as unknown as keyof typeof LocationType]
            )}
          </span>
        </div>
      ),
    }))

  const structureOptions =
    allMyStructures.data?.structures
      .filter((s) => s.location === newTradeRouteLocation.location)
      .map((s) => {
        const location = availableLocations.find(
          (l) => l?.symbol === s.location
        )
        return {
          value: s.id,
          label:
            StructureCategory[
              s.type as unknown as keyof typeof StructureCategory
            ],
          tags: [s.location, `(${location?.x}, ${location?.y})`],
          icon: (
            <div className="flex items-center justify-center w-5 h-5">
              <span className="text-xs">
                {getIconForLocationType(LocationType.STRUCTURE)}
              </span>
            </div>
          ),
        }
      }) ?? []

  const goodTradeOptions =
    goodTypes.data?.goods.map((g) => {
      const availableGood = availableGoods.data?.marketplace.find((m) => {
        return m.symbol === g.symbol
      })
      return {
        value: g.symbol,
        label: g.name,
        tags: [
          !availableGoods.isLoading
            ? availableGood
              ? newTradeRouteTrade.type === RouteEventType.BUY
                ? `Buy: ${formatNumberCommas(
                    availableGood.purchasePricePerUnit
                  )}`
                : RouteEventType.SELL
                ? `Sell: ${formatNumberCommas(availableGood.sellPricePerUnit)}`
                : '0'
              : 'None'
            : 'Loading...',
        ],
        disabled: !availableGood,
      }
    }) ?? []

  const goodStructureOptions = useMemo(() => {
    const structure =
      newTradeRouteStructure.structure &&
      allMyStructures.data?.structures.find(
        (s) => s.id === newTradeRouteStructure.structure?.structure
      )
    return (
      goodTypes.data?.goods
        .filter(
          (g) =>
            (newTradeRouteStructure.type === RouteEventType.WITHDRAW &&
              structure?.produces &&
              Object.values(structure.produces).includes(g.symbol)) ||
            (newTradeRouteStructure.type === RouteEventType.DEPOSIT &&
              structure?.consumes &&
              Object.values(structure.consumes).includes(g.symbol))
        )
        ?.map((g) => ({
          value: g.symbol,
          label: g.name,
          tags: [
            String(
              formatNumberCommas(
                structure?.inventory?.find((i) => i.good === g.symbol)
                  ?.quantity ?? 0
              )
            ),
          ],
        })) ?? []
    )
  }, [
    goodTypes.data?.goods,
    allMyStructures.data?.structures,
    newTradeRouteStructure,
  ])

  const shipOptions =
    myShips.data?.ships
      .filter(
        (s) =>
          !tradeRoutes.data
            ?.reduce(
              (acc: string[], cur) => [...acc, cur.assignedShips].flat(),
              []
            )
            .includes(s.id)
      )
      ?.sort(
        (a, b) =>
          Object.keys(System).indexOf(a.location?.split('-')[0] || '') -
            Object.keys(System).indexOf(b!.location?.split('-')[0] || '') ||
          a!.x! - b!.x! ||
          a!.y! - b!.y! ||
          a.type.localeCompare(b.type)
      )
      .map((ship) => ({
        value: ship.id,
        label: `${getShipName(ship.id)}
        `,
        tags: [
          ship.type,
          ship.location,
          `📦 ${ship.maxCargo - ship.spaceAvailable}/${ship.maxCargo}`,
        ],
        icon: (
          <div className="flex items-center justify-center w-5 h-5">
            <span className="text-xs">🚀</span>
          </div>
        ),
      })) ?? []

  const addGoodToTradeRouteDisabled =
    !(
      newTradeRoute.events.filter((e) => e.type === RouteEventType.TRAVEL)
        .length > 0
    ) || newTradeRouteTrade.good?.quantity === 0

  const addStructureToTradeRouteDisabled =
    !(
      newTradeRoute.events.filter((e) => e.type === RouteEventType.TRAVEL)
        .length > 0
    ) || newTradeRouteStructure.structure?.quantity === 0

  const handleSaveTradeRoute = async () => {
    if (newTradeRoute.id && newTradeRoute._version > 0) {
      try {
        await updateTradeRoute(newTradeRoute)
        setNewTradeRoute({
          ...newTradeRoute,
          _version: 0,
          id: '',
          events: [],
          assignedShips: [],
        })
        onUpdate && onUpdate()
      } catch (error) {
        console.error('Error adding trade route', error)
      }
    } else {
      try {
        await addTradeRoute(newTradeRoute)
        setNewTradeRoute({
          ...newTradeRoute,
          _version: 0,
          id: '',
          events: [],
          assignedShips: [],
        })
      } catch (error) {
        console.error('Error adding trade route', error)
      }
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 sm:divide-x sm:divide-gray-200 border-b">
        <div className="col-span-4">
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
                    setNewTradeRouteLocation((prev) => ({
                      ...prev,
                      location: undefined,
                    }))
                  }}
                />
              </div>
              <div className="sm:col-span-3">
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
                  className={
                    'inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' +
                    (!newTradeRoute || !newTradeRouteLocation.location
                      ? ' opacity-50 cursor-not-allowed'
                      : '')
                  }
                  disabled={!newTradeRoute || !newTradeRouteLocation.location}
                  onClick={(e) => {
                    e.preventDefault()
                    if (!newTradeRoute || !newTradeRouteLocation) {
                      return
                    }
                    setNewTradeRoute((prev) => ({
                      ...prev,
                      events: [...prev.events, newTradeRouteLocation],
                    }))
                    if (newTradeRouteLocation.location?.split('-')[1] === 'W') {
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
                  options={goodTradeOptions}
                  value={newTradeRouteTrade.good?.good}
                  onChange={(value) => {
                    setNewTradeRouteTrade((prev) => ({
                      ...prev,
                      good: {
                        ...prev.good,
                        good: value,
                        quantity: prev.good?.quantity ?? 0,
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
                  min={1}
                  onChange={(e) => {
                    e.preventDefault()
                    setNewTradeRouteTrade((prev) => {
                      const quantity = !isNaN(parseInt(e.target.value))
                        ? parseInt(e.target.value)
                        : 0
                      return {
                        ...prev,
                        good: {
                          ...prev.good,
                          good: prev.good?.good || '',
                          quantity,
                        },
                      }
                    })
                  }}
                />
              </div>
              <div className="sm:col-span-2">
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
              <div className="sm:col-span-1 pt-6">
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center px-4">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or automate transfers to and from structures
              </span>
            </div>
          </div>

          <form className="min-w-full divide-y divide-gray-200">
            <div className="p-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <Select
                  label="Select Structure"
                  options={structureOptions}
                  value={newTradeRouteStructure.structure?.structure}
                  onChange={(value) => {
                    setNewTradeRouteStructure((prev) => ({
                      ...prev,
                      structure: {
                        ...prev.structure!,
                        structure: value,
                      },
                    }))
                  }}
                />
              </div>
              <div className="sm:col-span-2">
                <Select
                  label="Action"
                  options={[
                    {
                      value: RouteEventType.WITHDRAW,
                      label: 'Withdraw',
                    },
                    {
                      value: RouteEventType.DEPOSIT,
                      label: 'Deposit',
                    },
                  ]}
                  value={newTradeRouteStructure?.type}
                  onChange={(value) => {
                    setNewTradeRouteStructure((prev) => ({
                      ...prev,
                      type: value as RouteEventType,
                    }))
                  }}
                />
              </div>
              <div className="sm:col-span-2">
                <Select
                  label="Select Good"
                  options={goodStructureOptions}
                  value={newTradeRouteStructure.structure?.good}
                  onChange={(value) => {
                    setNewTradeRouteStructure((prev) => ({
                      ...prev,
                      structure: {
                        ...prev.structure!,
                        good: value,
                        quantity: prev.structure?.quantity ?? 0,
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
                  min={1}
                  onChange={(e) => {
                    e.preventDefault()
                    setNewTradeRouteStructure((prev) => {
                      const quantity = !isNaN(parseInt(e.target.value))
                        ? parseInt(e.target.value)
                        : 0
                      return {
                        ...prev,
                        structure: {
                          ...prev.structure!,
                          good: prev.structure?.good || '',
                          quantity,
                        },
                      }
                    })
                  }}
                />
              </div>
              <div className="sm:col-span-1 pt-6">
                <button
                  type="submit"
                  className={
                    'inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' +
                    (addStructureToTradeRouteDisabled
                      ? ' opacity-50 cursor-not-allowed'
                      : '')
                  }
                  disabled={addStructureToTradeRouteDisabled}
                  onClick={(e) => {
                    e.preventDefault()
                    if (!newTradeRoute || !newTradeRouteStructure) {
                      return
                    }
                    setNewTradeRoute((prev) => ({
                      ...prev,
                      events: [...prev.events, newTradeRouteStructure],
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
        </div>

        <div className="col-span-2">
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
                checked={newTradeRoute?.autoRefuel}
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
              <div className="sm:col-span-4">
                <Select
                  label="Select Ship"
                  options={shipOptions.filter(
                    (s) => !newTradeRoute.assignedShips.includes(s.value)
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
                    (!newTradeRouteShip ? ' opacity-50 cursor-not-allowed' : '')
                  }
                  disabled={!newTradeRouteShip}
                  onClick={(e) => {
                    e.preventDefault()
                    if (!newTradeRoute || !newTradeRouteShip) {
                      return
                    }
                    setNewTradeRoute((prev) => ({
                      ...prev,
                      assignedShips: [...prev.assignedShips, newTradeRouteShip],
                    }))
                    setNewTradeRouteShip(undefined)
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
        </div>
      </div>

      <div className="p-6 w-full flex justify-end">
        <button
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => {
            handleSaveTradeRoute()
          }}
        >
          {routeToEdit ? 'Update' : 'Create'}
        </button>
      </div>
    </>
  )
}
