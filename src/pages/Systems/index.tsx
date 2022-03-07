import { useState, useEffect, useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  createNewFlightPlan,
  listMyShips,
  initiateWarpJump,
  getMyAccount,
} from '../../api/routes/my'
import {
  getSystemDockedShips,
  getSystemFlightPlans,
  getSystemInfo,
  getSystemLocations,
} from '../../api/routes/systems'
import '../../App.css'
import { Ship } from '../../types/Ship'
import moment from 'moment'
import LoadingRows from '../../components/Table/LoadingRows'
import ActiveProgress from '../../components/Progress/ActiveProgress'
import Select from '../../components/Select'
import { GoodType } from '../../types/Order'
import { getErrorMessage, getShipName } from '../../utils/helpers'
import {
  getIconForLocationType,
  LocationTrait,
  LocationType,
  System,
} from '../../types/Location'
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
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { PaperAirplaneIcon } from '@heroicons/react/solid'
import {
  NotificationContext,
  NotificationType,
} from '../../providers/NotificationProvider'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useTimeout } from '../../hooks/useTimeout'
import Header from '../../components/Header'
import Main from '../../components/Main'
import Section from '../../components/Section'
import Title from '../../components/Title'
import { GlobeIcon } from '@heroicons/react/outline'

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend)

export default function Systems() {
  const [newFlightPlan, setNewFlightPlan] =
    useState<{ shipId?: string; destination?: string; autoRefuel?: boolean }>()
  const [newWarpJump, setNewWarpJump] = useState<{ shipId?: string }>()
  const [showMap, setShowMap] = useState(false)

  const { sleep } = useTimeout()
  const { push } = useContext(NotificationContext)

  const navigate = useNavigate()
  const params = useParams()
  const queryClient = useQueryClient()
  const user = useQuery('user', getMyAccount)
  const myShips = useQuery('myShips', listMyShips)
  const system = useQuery(
    ['system', params.systemSymbol],
    () => getSystemInfo(params.systemSymbol ?? ''),
    {
      enabled: !!params.systemSymbol,
    }
  )
  const systemLocations = useQuery(
    ['systemLocations', params.systemSymbol],
    () => getSystemLocations(params.systemSymbol ?? ''),
    {
      enabled: !!params.systemSymbol,
    }
  )
  const systemFlightPlans = useQuery(
    ['systemFlightPlans', params.systemSymbol],
    () => getSystemFlightPlans(params.systemSymbol ?? ''),
    {
      enabled: !!params.systemSymbol,
    }
  )
  const systemDockedShips = useQuery(
    ['systemDockedShips', params.systemSymbol],
    () => getSystemDockedShips(params.systemSymbol ?? ''),
    {
      enabled: !!params.systemSymbol,
    }
  )

  const knownSystems = new Set(
    [
      System[0],
      ...(myShips.data?.ships.map((s) => s.location?.split('-')[0]) ?? []),
    ]
      .filter(Boolean)
      .sort(
        (a, b) =>
          Object.keys(System).indexOf(a!) - Object.keys(System).indexOf(b!)
      )
  )

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
    if (!params.systemSymbol) {
      navigate(`/systems/${System[0]}`, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.systemSymbol])

  const delayUpdateShips = async (delay: number, systemSymbol?: string) => {
    await sleep(delay)
    queryClient.invalidateQueries(['systemFlightPlans', systemSymbol])
    queryClient.invalidateQueries(['systemDockedShips', systemSymbol])
  }

  const handleCreateFlightPlan = useMutation(
    ({
      shipId,
      destination,
      autoRefuel,
    }: {
      shipId: string
      destination: string
      autoRefuel?: boolean
    }) => createNewFlightPlan(shipId, destination),
    {
      onSuccess: (data, variables) => {
        setNewFlightPlan((prev) => ({ ...prev, shipId: undefined }))
        queryClient.invalidateQueries([
          'systemFlightPlans',
          params.systemSymbol,
        ])
        queryClient.invalidateQueries([
          'systemDockedShips',
          params.systemSymbol,
        ])
        const { shipId, destination } = variables
        push({
          title: 'Flight plan created',
          message: `Ship ${getShipName(
            shipId
          )} is now in transit to ${destination} and will arrive ${moment(
            data.flightPlan.arrivesAt
          ).fromNow()}`,
          type: NotificationType.SUCCESS,
        })
        delayUpdateShips(
          data.flightPlan.timeRemainingInSeconds * 1000,
          params.systemSymbol
        )
      },
      onError: async (error: any, variables) => {
        const { shipId, autoRefuel } = variables
        if (error.code === 3001 && autoRefuel) {
          // Insufficient fuel, auto refuel
          const ship = myShips.data?.ships.find((s) => s.id === shipId)
          if (!ship) {
            throw new Error('Ship not found')
          }
          await refuel(ship, parseInt(error.message.match(/\d+/g)[0]))
          queryClient.invalidateQueries('user')
          // Retry create new flight plan
          handleCreateFlightPlan.mutate(variables)
        } else {
          push({
            title: 'Error creating flight plan',
            message: getErrorMessage(error),
            type: NotificationType.ERROR,
          })
        }
      },
    }
  )

  const handleInitiateWarpJump = useMutation(
    ({ shipId }: { shipId: string }) => initiateWarpJump(shipId),
    {
      onSuccess: async (data) => {
        queryClient.invalidateQueries([
          'systemFlightPlans',
          params.systemSymbol,
        ])
        queryClient.invalidateQueries([
          'systemDockedShips',
          params.systemSymbol,
        ])
        push({
          title: 'Warp jump initiated',
          message: `Ship ${getShipName(
            data.flightPlan.shipId
          )} is now in transit to ${
            data.flightPlan.destination
          } and will arrive ${moment(data.flightPlan.arrivesAt).fromNow()}`,
          type: NotificationType.SUCCESS,
        })
        delayUpdateShips(
          data.flightPlan.timeRemainingInSeconds * 1000,
          params.systemSymbol
        )
      },
      onError: (error: any) => {
        push({
          title: 'Error initiating warp jump',
          message: getErrorMessage(error),
          type: NotificationType.ERROR,
        })
      },
      onSettled: () => {
        setNewWarpJump(undefined)
      },
    }
  )

  const shipOptions =
    myShips.data?.ships
      .filter((s) => s.location?.split('-')[0] === system.data?.system.symbol)
      ?.map((ship) => ({
        value: ship.id,
        label: `${getShipName(ship.id)}
        `,
        tags: [
          ship.type,
          ship.location,
          `⛽ ${
            ship.cargo.find(
              (c) =>
                GoodType[c.good as unknown as keyof typeof GoodType] ===
                GoodType.FUEL
            )?.quantity ?? 0
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
    systemLocations.data?.locations.map((location) => ({
      value: location.symbol,
      label: location.name,
      tags: [location.symbol, `(${location.x}, ${location.y})`],
      icon: (
        <div className="flex items-center justify-center w-5 h-5">
          <span className="text-xs">
            {getIconForLocationType(
              LocationType[
                location.type as unknown as keyof typeof LocationType
              ]
            )}
          </span>
        </div>
      ),
    })) ?? []

  const myActiveFlightPlans =
    systemFlightPlans.data?.flightPlans.filter(
      (flightPlan) => flightPlan.username === user.data?.user.username
    ) ?? []

  // Might be more efficient to filter myShips, but we have to consider ships in transit
  const myDockedShips =
    (systemDockedShips.data?.ships
      .filter((s) => s.username === user.data?.user.username)
      ?.map((s) => myShips.data?.ships.find((ms) => ms.id === s.shipId))
      .filter((s) => s?.location) as Ship[]) ?? []

  return (
    <>
      <Header>Systems</Header>
      <Main>
        <div className="md:flex md:items-center md:justify-between md:space-x-5">
          <div className="flex items-start space-x-5">
            <div className="flex-shrink-0">
              <div className="relative">
                <span className="inline-block h-16 w-16 rounded-full overflow-hidden bg-white">
                  <GlobeIcon className="h-full w-full text-gray-300" />
                </span>
                <span
                  className="absolute inset-0 shadow-inner rounded-full"
                  aria-hidden="true"
                ></span>
              </div>
            </div>
            <div className="pt-1.5">
              {!system.isLoading ? (
                <>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {system.data?.system.name}
                  </h1>
                  <p className="text-sm font-medium text-gray-500">
                    {system.data?.system.symbol}
                  </p>
                </>
              ) : (
                <div className="flex flex-col justify-center animate-pulse">
                  <div className="mt-2 w-48 bg-gray-300 h-5 rounded-md"></div>
                  <div className="mt-2 w-12 bg-gray-300 h-3 rounded-md"></div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <Select
              label="Select System"
              options={knownSystemOptions}
              value={system.data?.system.symbol}
              disabled={system.isLoading}
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
                  {systemLocations.data?.locations.length ?? 0}
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
                Last updated:{' '}
                {moment(systemLocations.dataUpdatedAt).format(
                  'DD/MM/YY hh:mm:ss a'
                )}
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
                                      systemLocations.data?.locations[
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
                                data: systemLocations.data?.locations.map(
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
                        {!systemLocations.isLoading ? (
                          systemLocations.data?.locations
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
                                  {LocationType[
                                    location.type as unknown as keyof typeof LocationType
                                  ] ?? location.type}
                                </td>
                                <td className="px-6 py-4 text-sm leading-5 text-gray-500">
                                  {location.traits
                                    ?.map(
                                      (t) =>
                                        LocationTrait[
                                          t as keyof typeof LocationTrait
                                        ] ?? t
                                    )
                                    .join(', ')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                  {location.allowsConstruction ? 'Yes' : 'No'}
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

        <Title>Flight Plans</Title>

        <Section>
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Create New Flight Plan
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Select a ship and location to travel to.
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
                    <div className="flex items-center pt-6 sm:col-span-1 sm:justify-center">
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
                    <div className="flex pt-6 sm:col-span-1">
                      <button
                        type="submit"
                        className={
                          'inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' +
                          (!newFlightPlan?.shipId ||
                          !newFlightPlan.destination ||
                          handleCreateFlightPlan.isLoading
                            ? ' opacity-50 cursor-not-allowed'
                            : '')
                        }
                        disabled={
                          !newFlightPlan?.shipId ||
                          !newFlightPlan.destination ||
                          handleCreateFlightPlan.isLoading
                        }
                        onClick={(e) => {
                          e.preventDefault()
                          if (
                            !newFlightPlan?.shipId ||
                            !newFlightPlan.destination ||
                            handleCreateFlightPlan.isLoading
                          ) {
                            return
                          }
                          const { shipId, destination, autoRefuel } =
                            newFlightPlan
                          handleCreateFlightPlan.mutate({
                            shipId,
                            destination,
                            autoRefuel,
                          })
                        }}
                      >
                        {!handleCreateFlightPlan.isLoading ? (
                          'Create Flight Plan'
                        ) : (
                          <>
                            Creating
                            <div className="ml-2">
                              <LoadingSpinner />
                            </div>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Section>

        <Section>
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Active Flight Plans
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Last updated:{' '}
              {moment(systemFlightPlans.dataUpdatedAt).format(
                'DD/MM/YY hh:mm:ss a'
              )}
            </p>
          </div>
          <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg"></div>
                {systemFlightPlans.isLoading ||
                myActiveFlightPlans.length > 0 ? (
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
                      {!systemFlightPlans.isLoading ? (
                        myActiveFlightPlans.map((flightPlan, i) => (
                          <tr
                            key={flightPlan.id}
                            className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 font-medium text-gray-900">
                              {getShipName(flightPlan.shipId)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                              {
                                myShips.data?.ships.find(
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
                                'DD/MM/YY hh:mm:ss a'
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                              {moment(flightPlan.arrivesAt).format(
                                'DD/MM/YY hh:mm:ss a'
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
                        <LoadingRows cols={7} rows={3} />
                      )}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex justify-center">
                    <div className="w-full py-8 px-4">
                      <div className="flex flex-col items-center text-center mb-4">
                        <PaperAirplaneIcon className="w-12 h-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          No active flight plans!
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Why stay earthbound when prosperity awaits in the
                          stars?
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Section>

        <Section>
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Docked Ships
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Last updated:{' '}
              {moment(systemDockedShips.dataUpdatedAt).format(
                'DD/MM/YY hh:mm:ss a'
              )}
            </p>
          </div>
          <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg"></div>
                {systemDockedShips.isLoading || myDockedShips.length > 0 ? (
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
                      {!systemDockedShips.isLoading ? (
                        myDockedShips
                          .sort((a, b) => a.x! - b.x! || a.y! - b.y!)
                          .map((ship, i) => (
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
                        <LoadingRows cols={3} rows={3} />
                      )}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex justify-center">
                    <div className="w-full py-8 px-4">
                      <div className="flex flex-col items-center text-center mb-4">
                        <PaperAirplaneIcon className="w-12 h-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          No docked ships!
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          No ships docked in this system.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Section>

        <Section>
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Warp Jumps
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Select a ship to initiate a warp jump. The ship must be docked at
              a wormhole.
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
                        className={
                          'inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500' +
                          (!newWarpJump?.shipId
                            ? ' opacity-50 cursor-not-allowed'
                            : '')
                        }
                        disabled={!newWarpJump?.shipId}
                        onClick={(e) => {
                          e.preventDefault()
                          if (!newWarpJump?.shipId) {
                            return
                          }
                          handleInitiateWarpJump.mutate({
                            shipId: newWarpJump.shipId,
                          })
                        }}
                      >
                        {!handleInitiateWarpJump.isLoading ? (
                          'Initiate Jump'
                        ) : (
                          <>
                            Initiating
                            <div className="ml-2">
                              <LoadingSpinner />
                            </div>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Section>
      </Main>
    </>
  )
}
