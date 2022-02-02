import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  createNewFlightPlan,
  listMyShips,
  initiateWarpJump,
} from '../../api/routes/my'
import {
  getSystemDockedShips,
  getSystemFlightPlans,
  getSystemInfo,
  getSystemLocations,
} from '../../api/routes/systems'
import '../../App.css'
import { ListShipsResponse, Ship } from '../../types/Ship'
import {
  ListSystemFlightPlansResponse,
  ListSystemLocationsResponse,
  SystemDockedShipsResponse,
  SystemsResponse,
} from '../../types/System'
import moment from 'moment'
import LoadingRows from '../../components/Table/LoadingRows'
import Alert from '../../components/Alert'
import ActiveProgress from '../../components/Progress/ActiveProgress'
import Select from '../../components/Select'
import { GoodType } from '../../types/Order'
import { getShipName } from '../../utils/helpers'
import { LocationTrait, LocationType, System } from '../../types/Location'
import { useUpdateUser } from '../../hooks/useUpdateUser'
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Scatter } from 'react-chartjs-2'
import { refuel } from '../../utils/mechanics'
import { useAuth } from '../../hooks/useAuth'

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend)

function Systems() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()
  const [currentSystem, setCurrentSystem] = useState<SystemsResponse>()
  const [availableLocations, setAvailableLocations] =
    useState<ListSystemLocationsResponse>()
  const [allFlightPlans, setAllFlightPlans] =
    useState<ListSystemFlightPlansResponse>()
  const [allDockedShips, setAllDockedShips] =
    useState<SystemDockedShipsResponse>()
  const [myShips, setMyShips] = useState<ListShipsResponse>()
  const [newFlightPlan, setNewFlightPlan] =
    useState<{ shipId?: string; destination?: string; autoRefuel?: boolean }>()
  const [newWarpJump, setNewWarpJump] = useState<{ shipId?: string }>()
  const [showMap, setShowMap] = useState(false)

  const auth = useAuth()
  const updateUser = useUpdateUser()
  const navigate = useNavigate()
  const params = useParams()

  const updateCurrentSystem = async (systemSymbol: string) => {
    if (loading) {
      return
    }
    try {
      setLoading(true)
      setError(undefined)
      setCurrentSystem(await getSystemInfo(systemSymbol))
      setAvailableLocations(await getSystemLocations(systemSymbol))
      setAllFlightPlans(await getSystemFlightPlans(systemSymbol))
      setAllDockedShips(await getSystemDockedShips(systemSymbol))
    } catch (error: any) {
      console.error(error)
      if (error.code && error.code !== 400) {
        setError(error.message ?? 'Unknown error')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      setMyShips(await listMyShips())
    }
    init()
  }, [])

  const knownSystems = new Set(
    [
      System[0],
      ...(myShips?.ships.map((s) => s.location?.split('-')[0]) ?? []),
    ].filter((s) => s)
  )

  const knownSystemOptions: { value: string; label: string }[] = [
    ...knownSystems,
  ]
    .sort(
      (a, b) =>
        Object.keys(System).indexOf(a!) - Object.keys(System).indexOf(b!)
    )
    .map((s) => ({
      value: s!,
      label: s!,
      icon: (
        <div className="flex items-center justify-center w-5 h-5">
          <span className="text-xs">🌌</span>
        </div>
      ),
    }))

  useEffect(() => {
    if (!params.systemSymbol && knownSystemOptions.length > 0) {
      navigate(`/systems/${knownSystemOptions[0].value}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.systemSymbol, knownSystemOptions])

  useEffect(() => {
    if (params.systemSymbol) {
      updateCurrentSystem(params.systemSymbol)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.systemSymbol])

  const handleCreateFlightPlan = async (
    shipId: string,
    destination: string,
    autoRefuel?: boolean
  ) => {
    try {
      const result = await createNewFlightPlan(shipId, destination)
      console.log(result)
      setNewFlightPlan((prev) => ({ ...prev, shipId: undefined }))
      if (!currentSystem) {
        throw new Error('No current system')
      }
      setAllFlightPlans(await getSystemFlightPlans(currentSystem.system.symbol))
    } catch (error: any) {
      if (error.code === 3001 && autoRefuel) {
        // Insufficient fuel, auto refuel
        const ship = myShips?.ships.find((s) => s.id === shipId)
        if (!ship) {
          throw new Error('Ship not found')
        }
        const { credits } = await refuel(
          ship,
          parseInt(error.message.match(/\d+/g)[0])
        )
        updateUser({ credits })
        // Retry create new flight plan
        handleCreateFlightPlan(shipId, destination)
      } else {
        console.error(error)
      }
    }
  }

  const handleInitiateWarpJump = async (shipId: string) => {
    try {
      const result = await initiateWarpJump(shipId)
      console.log(result)
      setNewWarpJump(() => ({ shipId: undefined }))
      if (!currentSystem) {
        throw new Error('No current system')
      }
      setAllFlightPlans(await getSystemFlightPlans(currentSystem.system.symbol))
    } catch (error) {
      console.error(error)
    }
  }

  const getIconForLocationType = (type: LocationType) => {
    switch (type) {
      case LocationType.PLANET:
        return '🪐'
      case LocationType.MOON:
        return '🌑'
      case LocationType.ASTEROID:
        return '☄️'
      case LocationType.GAS_GIANT:
        return '💨'
      case LocationType.WORMHOLE:
        return '🕳️'
      case LocationType.NEBULA:
        return '🌌'
      default:
        return '🪐'
    }
  }

  const shipOptions =
    myShips?.ships
      .filter((s) => s.location?.split('-')[0] === currentSystem?.system.symbol)
      ?.map((ship) => ({
        value: ship.id,
        label: `${getShipName(ship.id)}
        `,
        tags: [
          ship.type,
          ship.location,
          `⛽ ${
            // @ts-expect-error
            ship.cargo.find((c) => GoodType[c.good] === GoodType.FUEL)
              ?.quantity ?? 0
          }`,
          `📦 ${ship.maxCargo - ship.spaceAvailable}/${ship.maxCargo}`,
        ],
        icon: (
          <div className="flex items-center justify-center w-5 h-5">
            <span className="text-xs">🚀</span>
          </div>
        ),
      })) ?? []

  const locationOptions =
    availableLocations?.locations.map((location) => ({
      value: location.symbol,
      label: location.name,
      tags: [location.symbol, `(${location.x}, ${location.y})`],
      icon: (
        <div className="flex items-center justify-center w-5 h-5">
          <span className="text-xs">
            {getIconForLocationType(
              // @ts-expect-error
              LocationType[location.type]
            )}
          </span>
        </div>
      ),
    })) ?? []

  const myActiveFlightPlans = allFlightPlans?.flightPlans.filter(
    (flightPlan) => flightPlan.username === auth.user?.username
  )

  // Might be more efficient to filter myShips, but we have to consider ships in transit
  const myDockedShips =
    (allDockedShips?.ships
      .filter((s) => s.username === auth.user?.username)
      ?.map((s) => myShips?.ships.find((ms) => ms.id === s.shipId))
      .filter((s) => s?.location) as Ship[]) ?? []

  return (
    <>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Systems</h1>
        </div>
      </header>
      <main>
        <div className="bg-gray-100 min-h-screen">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {error && (
              <div className="mb-4">
                <Alert message={error} />
              </div>
            )}

            <div className="md:flex md:items-center md:justify-between md:space-x-5">
              <div className="flex items-start space-x-5">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <span className="inline-block h-16 w-16 rounded-full overflow-hidden bg-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-full w-full text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </span>
                    <span
                      className="absolute inset-0 shadow-inner rounded-full"
                      aria-hidden="true"
                    ></span>
                  </div>
                </div>
                <div className="pt-1.5">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {currentSystem?.system.name}
                  </h1>
                  <p className="text-sm font-medium text-gray-500">
                    {currentSystem?.system.symbol}
                  </p>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <Select
                  label="Select System"
                  options={knownSystemOptions}
                  value={currentSystem?.system.symbol}
                  disabled={loading}
                  onChange={(value) => {
                    navigate(`/systems/${value}`)
                  }}
                />
              </div>
            </div>

            <div>
              <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Locations
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {availableLocations?.locations.length}
                    </dd>
                  </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Flight plans
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {myActiveFlightPlans?.length ?? 0}
                    </dd>
                  </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Docked ships
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {myDockedShips?.length ?? 0}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            <div className="mt-5 bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6 inline-flex justify-between w-full">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Locations
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    {currentSystem &&
                      `${currentSystem?.system.symbol} - ${currentSystem?.system.name}`}
                  </p>
                </div>
                <div className="mt-1">
                  <button
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    type="button"
                    onClick={() => {
                      setShowMap((prev) => !prev)
                    }}
                  >
                    {showMap ? 'View table' : 'View map'}
                  </button>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                      {showMap ? (
                        <div className="p-4 flex-auto">
                          <div className="relative h-350-px">
                            <Scatter
                              options={{
                                plugins: {
                                  legend: {
                                    display: false,
                                  },
                                  tooltip: {
                                    callbacks: {
                                      label: function (ctx) {
                                        let label =
                                          availableLocations?.locations[
                                            ctx.dataIndex
                                          ]?.name ?? 'Unknown'
                                        label +=
                                          ' (' +
                                          ctx.parsed.x +
                                          ', ' +
                                          ctx.parsed.y +
                                          ')'
                                        return label
                                      },
                                    },
                                  },
                                },
                              }}
                              data={{
                                datasets: [
                                  {
                                    data: availableLocations?.locations.map(
                                      (l) => ({ x: l.x, y: l.y })
                                    ),
                                    backgroundColor: 'rgb(99, 102, 241)',
                                    pointRadius: 5,
                                  },
                                ],
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                                Name
                              </th>
                              <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                                Symbol
                              </th>
                              <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                                Type
                              </th>
                              <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                                Traits
                              </th>
                              <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                                Allows Construction
                              </th>
                              <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                                Coordinates
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {availableLocations ? (
                              availableLocations.locations
                                .sort((a, b) => a.x - b.x || a.y - b.y)
                                .map((location, i) => (
                                  <tr
                                    key={location.symbol}
                                    className={
                                      i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                    }
                                  >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 font-medium text-gray-900">
                                      {location.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                      {location.symbol}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                      {/* @ts-expect-error */}
                                      {LocationType[location.type] ??
                                        location.type}
                                    </td>
                                    <td className="px-6 py-4 text-sm leading-5 text-gray-500">
                                      {location.traits
                                        // @ts-expect-error
                                        ?.map((t) => LocationTrait[t] ?? t)
                                        .join(', ')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                      {location.allowsConstruction
                                        ? 'Yes'
                                        : 'No'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                      ({location.x}, {location.y})
                                    </td>
                                  </tr>
                                ))
                            ) : (
                              <LoadingRows cols={6} />
                            )}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto py-6">
              <h2 className="text-2xl font-bold text-gray-900">Flight Plans</h2>
            </div>

            <div className="bg-white shadow sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Create New Flight Plan
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {currentSystem &&
                    `${currentSystem?.system.symbol} - ${currentSystem?.system.name}`}
                </p>
              </div>
              <div className="flex flex-col">
                <div className="-my-2 sm:-mx-6 lg:-mx-8">
                  <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg"></div>
                    <form className="min-w-full divide-y divide-gray-200">
                      <div className="p-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-2">
                          <Select
                            label="Select Ship"
                            options={shipOptions ?? []}
                            value={newFlightPlan?.shipId}
                            onChange={(value) => {
                              setNewFlightPlan({
                                ...newFlightPlan,
                                shipId: value,
                              })
                            }}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Select
                            label="Select Location"
                            options={locationOptions}
                            value={newFlightPlan?.destination}
                            onChange={(value) => {
                              setNewFlightPlan({
                                ...newFlightPlan,
                                destination: value,
                              })
                            }}
                          />
                        </div>
                        <div className="flex items-center sm:col-span-1 pt-6">
                          <div className="flex items-center">
                            <input
                              id="autoRefuel"
                              name="autoRefuel"
                              type="checkbox"
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              onChange={(e) => {
                                setNewFlightPlan({
                                  ...newFlightPlan,
                                  autoRefuel: e.target.checked,
                                })
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
                        <div className="sm:col-span-1 pt-6">
                          <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={(e) => {
                              e.preventDefault()
                              if (
                                !newFlightPlan?.shipId ||
                                !newFlightPlan.destination
                              ) {
                                return
                              }
                              handleCreateFlightPlan(
                                newFlightPlan.shipId,
                                newFlightPlan.destination,
                                newFlightPlan.autoRefuel
                              )
                            }}
                          >
                            Create
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Active Flight Plans
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {currentSystem &&
                    `${currentSystem?.system.symbol} - ${currentSystem?.system.name}`}
                </p>
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
                              Name
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Type
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Departure
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Destination
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Created At
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Arrives At
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Progress
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {myActiveFlightPlans &&
                          myActiveFlightPlans.length > 0 ? (
                            myActiveFlightPlans.map((flightPlan, i) => (
                              <tr
                                key={flightPlan.id}
                                className={
                                  i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                }
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 font-medium text-gray-900">
                                  {getShipName(flightPlan.shipId)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                  {
                                    myShips?.ships.find(
                                      (s) => s.id === flightPlan.shipId
                                    )?.type
                                  }
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                  {flightPlan.departure}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                  {flightPlan.destination}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                  {moment(flightPlan.createdAt).format(
                                    'DD/MM/YYYY hh:mm:ss a'
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                  {moment(flightPlan.arrivesAt).format(
                                    'DD/MM/YYYY hh:mm:ss a'
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                  <ActiveProgress
                                    start={moment(flightPlan.createdAt)}
                                    end={moment(flightPlan.arrivesAt)}
                                  />
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr className="bg-white text-center">
                              <td
                                className="px-6 py-4 text-gray-500"
                                colSpan={7}
                              >
                                You have no active flight plans.
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

            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Docked Ships
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {currentSystem &&
                    `${currentSystem?.system.symbol} - ${currentSystem?.system.name}`}
                </p>
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
                              Name
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Type
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Location
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {myDockedShips && myDockedShips.length > 0 ? (
                            myDockedShips.map((ship, i) => (
                              <tr
                                key={ship.id}
                                className={
                                  i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                }
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 font-medium text-gray-900">
                                  {getShipName(ship.id)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                  {ship.type}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                  {ship.flightPlanId
                                    ? 'In transit'
                                    : ship.location}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr className="bg-white text-center">
                              <td
                                className="px-6 py-4 text-gray-500"
                                colSpan={3}
                              >
                                You have no docked ships.
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

            <div className="bg-white shadow sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Warp Jumps
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {currentSystem &&
                    `${currentSystem?.system.symbol} - ${currentSystem?.system.name}`}
                </p>
              </div>
              <div className="flex flex-col">
                <div className="-my-2 sm:-mx-6 lg:-mx-8">
                  <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg"></div>
                    <form className="min-w-full divide-y divide-gray-200">
                      <div className="p-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-2">
                          <Select
                            label="Select Ship"
                            options={
                              shipOptions.filter(
                                (o) =>
                                  myDockedShips
                                    .find((s) => s.id === o.value)
                                    ?.location?.split('-')[1] === 'W'
                              ) ?? []
                            }
                            value={newWarpJump?.shipId}
                            onChange={(value) => {
                              setNewWarpJump({
                                shipId: value,
                              })
                            }}
                          />
                        </div>
                        <div className="sm:col-span-2 pt-6">
                          <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                            onClick={(e) => {
                              e.preventDefault()
                              if (!newWarpJump?.shipId) {
                                return
                              }
                              handleInitiateWarpJump(newWarpJump.shipId)
                            }}
                          >
                            Initiate Jump
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default Systems
