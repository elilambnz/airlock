import {
  ArrowDownIcon,
  ArrowUpIcon,
  CubeIcon,
  GlobeIcon,
  OfficeBuildingIcon,
  UserIcon,
} from '@heroicons/react/solid'
import moment from 'moment'
import { useContext, useMemo, useState } from 'react'
import { useMutation, useQueries, useQuery, useQueryClient } from 'react-query'
import {
  listMyStructures,
  createNewStructure,
  depositToMyStructure,
  withdrawFromMyStructure,
  listMyShips,
} from '../../api/routes/my'
import {
  depositToStructure,
  getStructureInfo,
} from '../../api/routes/structures'
import { getSystemLocations } from '../../api/routes/systems'
import { listStructureTypes } from '../../api/routes/types'
import '../../App.css'
import Alert from '../../components/Alert'
import Header from '../../components/Header'
import LoadingSpinner from '../../components/LoadingSpinner'
import Main from '../../components/Main'
import Modal from '../../components/Modal/index'
import Section from '../../components/Section'
import Title from '../../components/Title'
import Select from '../../components/Select'
import LoadingRows from '../../components/Table/LoadingRows'
import {
  NotificationContext,
  NotificationType,
} from '../../providers/NotificationProvider'
import { System } from '../../types/Location'
import { GoodType } from '../../types/Order'
import { Structure, StructureCategory } from '../../types/Structure'
import {
  abbreviateNumber,
  formatNumberCommas,
  getErrorMessage,
  getShipName,
} from '../../utils/helpers'

export default function Structures() {
  const [newStructure, setNewStructure] =
    useState<{ type?: string; location?: string }>()
  const [structureToQuery, setStructureToQuery] =
    useState<{ structureId?: string }>()
  const [ownStructureToDeposit, setOwnStructureToDeposit] = useState<
    | (Structure & {
        deposit?: {
          shipId?: string
          good?: GoodType
          quantity?: number
        }
      })
    | undefined
  >()
  const [ownStructureToWithdraw, setOwnStructureToWithdraw] = useState<
    | (Structure & {
        withdraw?: {
          shipId?: string
          good?: GoodType
          quantity?: number
        }
      })
    | undefined
  >()
  const [structureToDeposit, setStructureToDeposit] = useState<
    | (Structure & {
        deposit?: {
          shipId?: string
          good?: GoodType
          quantity?: number
        }
      })
    | undefined
  >()

  const { push } = useContext(NotificationContext)

  const queryClient = useQueryClient()
  const myShips = useQuery('myShips', listMyShips)
  const allMyStructures = useQuery('myStructures', listMyStructures)
  const structure = useQuery(
    ['structure', structureToQuery?.structureId],
    () => getStructureInfo(structureToQuery?.structureId ?? ''),
    {
      enabled: !!structureToQuery?.structureId,
      retry: false, // Don't retry on failure because the API will return a 500 error if the structure doesn't exist
    }
  )

  const structureTypes = useQuery('structureTypes', listStructureTypes)

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

  const handleCreateStructure = useMutation(
    ({ location, type }: { location: string; type: string }) =>
      createNewStructure(location, type),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('myStructures')
        push({
          title: 'Structure created',
          message: `${data.structure.type} structure created at ${data.structure.location}`,
          type: NotificationType.SUCCESS,
        })
      },
      onError: (error: any) => {
        push({
          title: 'Error creating structure',
          message: getErrorMessage(error),
          type: NotificationType.ERROR,
        })
      },
      onSettled: () => {
        setNewStructure(undefined)
      },
    }
  )

  const handleDepositGoodsToOwnStructure = useMutation(
    ({
      structureId,
      shipId,
      good,
      quantity,
    }: {
      structureId: string
      shipId: string
      good: GoodType
      quantity: number
    }) => depositToMyStructure(structureId, shipId, good, quantity),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries('myStructures')
        queryClient.invalidateQueries('myShips')
        const { structureId, good, quantity } = variables
        const updatedStructure = allMyStructures.data?.structures.find(
          (s) => s.id === structureId
        )
        push({
          title: 'Goods deposited',
          message: `${quantity} ${
            GoodType[good as unknown as keyof typeof GoodType]
          } deposited to ${
            StructureCategory[
              updatedStructure?.type as unknown as keyof typeof StructureCategory
            ]
          } at ${updatedStructure?.location}`,
          type: NotificationType.SUCCESS,
        })
      },
      onError: (error: any) => {
        push({
          title: 'Error depositing goods',
          message: getErrorMessage(error),
          type: NotificationType.ERROR,
        })
      },
    }
  )

  const handleWithdrawGoodsFromOwnStructure = useMutation(
    ({
      structureId,
      shipId,
      good,
      quantity,
    }: {
      structureId: string
      shipId: string
      good: GoodType
      quantity: number
    }) => withdrawFromMyStructure(structureId, shipId, good, quantity),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries('myStructures')
        queryClient.invalidateQueries('myShips')
        const { structureId, good, quantity } = variables
        const updatedStructure = allMyStructures.data?.structures.find(
          (s) => s.id === structureId
        )
        push({
          title: 'Goods withdrawn',
          message: `${quantity} ${
            GoodType[good as unknown as keyof typeof GoodType]
          } withdrawn from ${
            StructureCategory[
              updatedStructure?.type as unknown as keyof typeof StructureCategory
            ]
          } at ${updatedStructure?.location}`,
          type: NotificationType.SUCCESS,
        })
      },
      onError: (error: any) => {
        push({
          title: 'Error withdrawing goods',
          message: getErrorMessage(error),
          type: NotificationType.ERROR,
        })
      },
    }
  )

  const handleDepositGoodsToStructure = useMutation(
    ({
      structureId,
      shipId,
      good,
      quantity,
    }: {
      structureId: string
      shipId: string
      good: GoodType
      quantity: number
    }) => depositToStructure(structureId, shipId, good, quantity),
    {
      onSuccess: (_, variables) => {
        const { structureId, good, quantity } = variables
        queryClient.invalidateQueries(['structure', structureId])
        queryClient.invalidateQueries('myShips')
        const updatedStructure = allMyStructures.data?.structures.find(
          (s) => s.id === structureId
        )
        push({
          title: 'Goods deposited',
          message: `${quantity} ${
            GoodType[good as unknown as keyof typeof GoodType]
          } deposited to ${
            StructureCategory[
              updatedStructure?.type as unknown as keyof typeof StructureCategory
            ]
          } at ${updatedStructure?.location}`,
          type: NotificationType.SUCCESS,
        })
      },
      onError: (error: any) => {
        push({
          title: 'Error depositing goods',
          message: getErrorMessage(error),
          type: NotificationType.ERROR,
        })
      },
    }
  )

  const structureTypeOptions =
    structureTypes.data?.structures.map((s) => ({
      value: s.type,
      label: s.name,
      tags: [
        `💰 ${abbreviateNumber(s.price)}`,
        `${s.consumes
          .map((c) => GoodType[c as unknown as keyof typeof GoodType])
          .join(', ')} → ${s.produces
          .map((p) => GoodType[p as unknown as keyof typeof GoodType])
          .join(', ')}`,
      ],
    })) ?? []

  const locationOptions =
    availableLocations
      .filter((l) => {
        const allowedLocationTypes =
          structureTypes.data?.structures.find(
            (s) => s.type === newStructure?.type
          )?.allowedLocationTypes ?? []
        return (
          !!l && l.allowsConstruction && allowedLocationTypes.includes(l.type)
        )
      })
      ?.map((l) => {
        const shipCount =
          myShips.data?.ships.filter((s) => s.location === l!.symbol).length ??
          0
        return {
          value: l!.symbol,
          label: l!.name,
          tags: [
            l!.symbol,
            `🚀 ${shipCount > 0 ? shipCount : 'No ships docked at location!'}`,
          ],
          disabled: shipCount === 0,
        }
      }) ?? []

  const shipOptions =
    myShips.data?.ships
      .filter(
        (s) =>
          s.location &&
          (s.location === ownStructureToDeposit?.location ||
            s.location === ownStructureToWithdraw?.location ||
            s.location === structureToDeposit?.location)
      )
      ?.map((ship) => ({
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

  return (
    <>
      <Header>Structures</Header>
      <Main>
        <Title>My Structures</Title>

        <Section>
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Create New Structure
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Structures can be used to generate goods.
            </p>
          </div>
          <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg"></div>
                <form className="min-w-full divide-y divide-gray-200">
                  <div className="p-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-2">
                      <Select
                        label="Select Structure Type"
                        options={structureTypeOptions}
                        value={newStructure?.type}
                        onChange={(value) => {
                          setNewStructure(() => ({
                            type: value,
                          }))
                        }}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Select
                        label="Select Location"
                        options={locationOptions}
                        value={newStructure?.location}
                        disabled={!newStructure?.type}
                        onChange={(value) => {
                          setNewStructure((prev) => ({
                            ...prev,
                            location: value,
                          }))
                        }}
                      />
                    </div>
                    <div className="flex pt-6 sm:col-span-2">
                      <button
                        type="submit"
                        className={
                          'inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' +
                          (!newStructure?.location ||
                          !newStructure.type ||
                          handleCreateStructure.isLoading
                            ? ' opacity-50 cursor-not-allowed'
                            : '')
                        }
                        disabled={
                          !newStructure?.location ||
                          !newStructure.type ||
                          handleCreateStructure.isLoading
                        }
                        onClick={(e) => {
                          e.preventDefault()
                          if (!newStructure?.location || !newStructure.type) {
                            return
                          }
                          const { location, type } = newStructure
                          handleCreateStructure.mutate({
                            location,
                            type,
                          })
                        }}
                      >
                        {!handleCreateStructure.isLoading ? (
                          `Create ${
                            newStructure?.type
                              ? `for ${formatNumberCommas(
                                  structureTypes.data?.structures.find(
                                    (s) => s.type === newStructure.type
                                  )?.price ?? 0
                                )} credits`
                              : ''
                          }`
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
              Structures
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Last updated:{' '}
              {moment(allMyStructures.dataUpdatedAt).format(
                'DD/MM/YY hh:mm:ss a'
              )}
            </p>
          </div>
          <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg"></div>
                {allMyStructures.isLoading ||
                (allMyStructures.data &&
                  allMyStructures.data.structures.length > 0) ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                          Active
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                          Consumes
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                          Produces
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
                      {!allMyStructures.isLoading ? (
                        allMyStructures.data.structures.map((structure, i) => (
                          <tr
                            key={structure.id}
                            className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 font-medium text-gray-900">
                              {
                                StructureCategory[
                                  structure.type as unknown as keyof typeof StructureCategory
                                ]
                              }
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                              {structure.location}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                              <span
                                className={
                                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full' +
                                  (structure.active
                                    ? ' bg-green-100 text-green-800'
                                    : ' bg-yellow-100 text-yellow-800')
                                }
                              >
                                {structure.active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm leading-5 text-gray-500">
                              {structure.status}
                            </td>
                            <td className="px-6 py-4 text-sm leading-5 text-gray-500">
                              {structure.consumes
                                .map(
                                  (good) =>
                                    `${
                                      GoodType[
                                        good as unknown as keyof typeof GoodType
                                      ]
                                    } (${formatNumberCommas(
                                      structure.inventory.find(
                                        (item) => item.good === good
                                      )?.quantity ?? 0
                                    )})`
                                )
                                .join(', ')}
                            </td>
                            <td className="px-6 py-4 text-sm leading-5 text-gray-500">
                              {structure.produces
                                .map(
                                  (good) =>
                                    `${
                                      GoodType[
                                        good as unknown as keyof typeof GoodType
                                      ]
                                    } (${formatNumberCommas(
                                      structure.inventory.find(
                                        (item) => item.good === good
                                      )?.quantity ?? 0
                                    )})`
                                )
                                .join(', ')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                className="text-indigo-600 hover:text-indigo-900"
                                onClick={() => {
                                  const structureToDeposit =
                                    allMyStructures.data.structures.find(
                                      (s) => s.id === structure.id
                                    )
                                  if (!structureToDeposit) {
                                    return
                                  }
                                  setOwnStructureToDeposit(structureToDeposit)
                                }}
                              >
                                Deposit
                              </button>
                              <button
                                className="ml-4 text-indigo-600 hover:text-indigo-900"
                                onClick={() => {
                                  const ownStructureToWithdraw =
                                    allMyStructures.data.structures.find(
                                      (s) => s.id === structure.id
                                    )
                                  if (!ownStructureToWithdraw) {
                                    return
                                  }
                                  setOwnStructureToWithdraw(
                                    ownStructureToWithdraw
                                  )
                                }}
                              >
                                Withdraw
                              </button>
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
                        <OfficeBuildingIcon className="w-12 h-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          No structures have been created yet.
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Create a structure to start generating your own goods.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Section>

        <Title>All Structures</Title>

        <Section>
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Find Structure
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Enter a known structure ID to get more information about it.
            </p>
          </div>
          <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg"></div>
                <form className="min-w-full divide-y divide-gray-200">
                  <div className="p-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="structureId"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Structure ID
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="structureId"
                          id="structureId"
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          onChange={(e) => {
                            setStructureToQuery({
                              ...structureToQuery,
                              structureId: e.target.value.trim(),
                            })
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </form>

                {!structure.isLoading && structure.data && (
                  <>
                    <div className="px-4 sm:px-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Structure Details
                      </h3>
                    </div>
                    <div className="px-6 py-4 bg-white">
                      <div className="inline-flex items-center">
                        <h3 className="text-md font-medium text-gray-900">
                          {
                            StructureCategory[
                              structure.data.structure
                                .type as unknown as keyof typeof StructureCategory
                            ]
                          }
                        </h3>
                        <span
                          className={
                            'ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full' +
                            (structure.data.structure.active
                              ? ' bg-green-100 text-green-800'
                              : ' bg-yellow-100 text-yellow-800')
                          }
                        >
                          {structure.data.structure.active
                            ? 'Active'
                            : 'Inactive'}
                        </span>
                      </div>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        {structure.data.structure.status}
                      </p>
                      <div className="flex items-center mt-2 py-1 text-sm leading-5 text-gray-500">
                        <span className="inline-flex items-center">
                          <span className="sr-only">Username</span>
                          <UserIcon className="mr-1 w-4 h-4 text-gray-900" />{' '}
                          {structure.data.structure.ownedBy.username}
                        </span>
                        <span className="ml-4 inline-flex items-center">
                          <span className="sr-only">Location</span>
                          <GlobeIcon className="mr-1 w-4 h-4 text-gray-900" />{' '}
                          {structure.data.structure.location}
                        </span>
                        <span className="ml-4 inline-flex items-center">
                          <span className="sr-only">Consumes</span>
                          <ArrowUpIcon className="mr-1 w-4 h-4 text-gray-900" />{' '}
                          {structure.data.structure.consumes
                            .map(
                              (c) =>
                                GoodType[c as unknown as keyof typeof GoodType]
                            )
                            .join(', ')}
                        </span>
                        <span className="ml-4 inline-flex items-center">
                          <span className="sr-only">Produces</span>
                          <ArrowDownIcon className="mr-1 w-4 h-4 text-gray-900" />{' '}
                          {structure.data.structure.produces
                            .map(
                              (c) =>
                                GoodType[c as unknown as keyof typeof GoodType]
                            )
                            .join(', ')}
                        </span>
                        <span className="ml-4 inline-flex items-center">
                          <span className="sr-only">Inventory</span>
                          <CubeIcon className="mr-1 w-4 h-4 text-gray-900" />{' '}
                          {structure.data.structure.inventory
                            .sort((a) =>
                              structure.data.structure.consumes.includes(a.good)
                                ? -1
                                : 1
                            )
                            .map(
                              (i) =>
                                `${i.quantity} ${
                                  GoodType[
                                    i.good as unknown as keyof typeof GoodType
                                  ]
                                }`
                            )
                            .join(', ')}
                        </span>
                      </div>

                      <button
                        className="mt-4 text-indigo-600 hover:text-indigo-900"
                        onClick={() => {
                          setStructureToDeposit(structure.data.structure)
                        }}
                      >
                        Deposit
                      </button>
                    </div>
                  </>
                )}
                {structure.isLoading && (
                  <div className="shadow rounded-md p-6 w-full mx-auto">
                    <div className="animate-pulse flex space-x-4">
                      <div className="rounded-full bg-gray-300 h-10 w-10"></div>
                      <div className="flex-1 space-y-6 py-1">
                        <div className="h-2 bg-gray-300 rounded"></div>
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="h-2 bg-gray-300 rounded col-span-2"></div>
                            <div className="h-2 bg-gray-300 rounded col-span-1"></div>
                          </div>
                          <div className="h-2 bg-gray-300 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {structure.isError && (
                  <div className="p-6 w-full mx-auto">
                    <Alert
                      title="Error fetching structure"
                      message={getErrorMessage(structure.error as any)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Section>
      </Main>
      <Modal
        open={!!ownStructureToDeposit}
        title="Deposit Goods"
        content={
          <>
            {ownStructureToDeposit && (
              <div className="mt-4 px-4 py-2">
                <form>
                  <div>
                    <h3 className="text-md font-medium text-gray-900">
                      Deposit Goods to{' '}
                      {
                        StructureCategory[
                          ownStructureToDeposit.type as unknown as keyof typeof StructureCategory
                        ]
                      }
                    </h3>
                  </div>
                  <div className="flex items-center mt-2 py-1 text-sm leading-5 text-gray-500">
                    <span className="inline-flex items-center">
                      <span className="sr-only">Location</span>
                      <GlobeIcon className="mr-1 w-4 h-4 text-gray-900" />{' '}
                      {ownStructureToDeposit.location}
                    </span>
                    <span className="ml-4 inline-flex items-center">
                      <span className="sr-only">Consumes</span>
                      <ArrowUpIcon className="mr-1 w-4 h-4 text-gray-900" />{' '}
                      {ownStructureToDeposit.consumes
                        .map(
                          (c) => GoodType[c as unknown as keyof typeof GoodType]
                        )
                        .join(', ')}
                    </span>
                    <span className="ml-4 inline-flex items-center">
                      <span className="sr-only">Produces</span>
                      <ArrowDownIcon className="mr-1 w-4 h-4 text-gray-900" />{' '}
                      {ownStructureToDeposit.produces
                        .map(
                          (c) => GoodType[c as unknown as keyof typeof GoodType]
                        )
                        .join(', ')}
                    </span>
                  </div>
                  {shipOptions.length > 0 ? (
                    <>
                      <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-4">
                          <Select
                            label="From Ship"
                            options={shipOptions}
                            value={ownStructureToDeposit.deposit?.shipId}
                            onChange={(value) => {
                              setOwnStructureToDeposit((prev) => {
                                if (!prev) {
                                  return
                                }
                                return {
                                  ...prev,
                                  deposit: {
                                    ...prev.deposit,
                                    shipId: value,
                                  },
                                }
                              })
                            }}
                          />
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                          <Select
                            label="Select Good"
                            options={
                              ownStructureToDeposit.consumes.map((g) => ({
                                label:
                                  GoodType[
                                    g as unknown as keyof typeof GoodType
                                  ],
                                value: g,
                              })) ?? []
                            }
                            value={ownStructureToDeposit.deposit?.good}
                            onChange={(value) => {
                              setOwnStructureToDeposit((prev) => {
                                if (!prev) {
                                  return
                                }
                                return {
                                  ...prev,
                                  deposit: {
                                    ...prev.deposit,
                                    good: value as GoodType,
                                  },
                                }
                              })
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
                          <div className="mt-1">
                            <input
                              type="number"
                              name="quantity"
                              id="quantity"
                              min={1}
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              onChange={(e) => {
                                const quantity = !isNaN(
                                  parseInt(e.target.value)
                                )
                                  ? parseInt(e.target.value)
                                  : 0
                                setOwnStructureToDeposit((prev) => {
                                  if (!prev) {
                                    return
                                  }
                                  return {
                                    ...prev,
                                    deposit: {
                                      ...prev.deposit,
                                      quantity,
                                    },
                                  }
                                })
                              }}
                            />
                          </div>
                        </div>
                        <div className="pt-6 sm:col-span-2">
                          <button
                            type="submit"
                            className={
                              'truncate inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' +
                              (ownStructureToDeposit.deposit?.quantity === 0 ||
                              !ownStructureToDeposit.deposit?.shipId ||
                              handleDepositGoodsToOwnStructure.isLoading
                                ? ' opacity-50 cursor-not-allowed'
                                : '')
                            }
                            disabled={
                              ownStructureToDeposit.deposit?.quantity === 0 ||
                              !ownStructureToDeposit.deposit?.shipId ||
                              handleDepositGoodsToOwnStructure.isLoading
                            }
                            onClick={(e) => {
                              e.preventDefault()
                              if (
                                !ownStructureToDeposit.id ||
                                !ownStructureToDeposit.deposit?.shipId ||
                                !ownStructureToDeposit.deposit?.good ||
                                !ownStructureToDeposit.deposit?.quantity
                              ) {
                                return
                              }
                              handleDepositGoodsToOwnStructure.mutate({
                                structureId: ownStructureToDeposit.id,
                                shipId: ownStructureToDeposit.deposit?.shipId,
                                good: ownStructureToDeposit.deposit?.good,
                                quantity:
                                  ownStructureToDeposit.deposit?.quantity,
                              })
                            }}
                          >
                            {!handleDepositGoodsToOwnStructure.isLoading ? (
                              `Deposit ${
                                !!ownStructureToDeposit.deposit?.quantity &&
                                ownStructureToDeposit.deposit?.quantity > 0
                                  ? `${formatNumberCommas(
                                      ownStructureToDeposit.deposit?.quantity
                                    )} units`
                                  : ''
                              }`
                            ) : (
                              <>
                                Depositing goods
                                <div className="ml-2">
                                  <LoadingSpinner />
                                </div>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-center">
                      <div className="w-full py-4">
                        <div className="flex flex-col items-center text-center mb-4">
                          <h3 className="mt-2 text-sm font-medium text-gray-900">
                            No ships available to deposit goods.
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Ships must be docked in this location to deposit
                            goods.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            )}
          </>
        }
        onClose={() => setOwnStructureToDeposit(undefined)}
        className="w-full md:max-w-xl"
      />
      <Modal
        open={!!ownStructureToWithdraw}
        title="Withdraw Goods"
        content={
          <>
            {ownStructureToWithdraw && (
              <div className="mt-4 px-4 py-2">
                <form>
                  <div>
                    <h3 className="text-md font-medium text-gray-900">
                      Withdraw Goods from{' '}
                      {
                        StructureCategory[
                          ownStructureToWithdraw.type as unknown as keyof typeof StructureCategory
                        ]
                      }
                    </h3>
                  </div>
                  <div className="flex items-center mt-2 py-1 text-sm leading-5 text-gray-500">
                    <span className="inline-flex items-center">
                      <span className="sr-only">Location</span>
                      <GlobeIcon className="mr-1 w-4 h-4 text-gray-900" />{' '}
                      {ownStructureToWithdraw.location}
                    </span>
                    <span className="ml-4 inline-flex items-center">
                      <span className="sr-only">Consumes</span>
                      <ArrowUpIcon className="mr-1 w-4 h-4 text-gray-900" />{' '}
                      {ownStructureToWithdraw.consumes
                        .map(
                          (c) => GoodType[c as unknown as keyof typeof GoodType]
                        )
                        .join(', ')}
                    </span>
                    <span className="ml-4 inline-flex items-center">
                      <span className="sr-only">Produces</span>
                      <ArrowDownIcon className="mr-1 w-4 h-4 text-gray-900" />{' '}
                      {ownStructureToWithdraw.produces
                        .map(
                          (c) => GoodType[c as unknown as keyof typeof GoodType]
                        )
                        .join(', ')}
                    </span>
                  </div>
                  {shipOptions.length > 0 ? (
                    <>
                      <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                          <Select
                            label="To Ship"
                            options={shipOptions}
                            value={ownStructureToWithdraw.withdraw?.shipId}
                            onChange={(value) => {
                              setOwnStructureToWithdraw((prev) => {
                                if (!prev) {
                                  return
                                }
                                return {
                                  ...prev,
                                  withdraw: {
                                    ...prev.withdraw,
                                    shipId: value,
                                  },
                                }
                              })
                            }}
                          />
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                          <Select
                            label="Select Good"
                            options={
                              ownStructureToWithdraw.produces.map((g) => ({
                                label:
                                  GoodType[
                                    g as unknown as keyof typeof GoodType
                                  ],
                                value: g,
                              })) ?? []
                            }
                            value={ownStructureToWithdraw.withdraw?.good}
                            onChange={(value) => {
                              setOwnStructureToWithdraw((prev) => {
                                if (!prev) {
                                  return
                                }
                                return {
                                  ...prev,
                                  withdraw: {
                                    ...prev.withdraw,
                                    good: value as GoodType,
                                  },
                                }
                              })
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
                          <div className="mt-1">
                            <input
                              type="number"
                              name="quantity"
                              id="quantity"
                              min={1}
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              onChange={(e) => {
                                const quantity = !isNaN(
                                  parseInt(e.target.value)
                                )
                                  ? parseInt(e.target.value)
                                  : 0
                                setOwnStructureToWithdraw((prev) => {
                                  if (!prev) {
                                    return
                                  }
                                  return {
                                    ...prev,
                                    withdraw: {
                                      ...prev.withdraw,
                                      quantity,
                                    },
                                  }
                                })
                              }}
                            />
                          </div>
                        </div>
                        <div className="pt-6 sm:col-span-2">
                          <button
                            type="submit"
                            className={
                              'truncate inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' +
                              (ownStructureToWithdraw.withdraw?.quantity ===
                                0 ||
                              !ownStructureToWithdraw.withdraw?.shipId ||
                              handleWithdrawGoodsFromOwnStructure.isLoading
                                ? ' opacity-50 cursor-not-allowed'
                                : '')
                            }
                            disabled={
                              ownStructureToWithdraw.withdraw?.quantity === 0 ||
                              !ownStructureToWithdraw.withdraw?.shipId ||
                              handleWithdrawGoodsFromOwnStructure.isLoading
                            }
                            onClick={(e) => {
                              e.preventDefault()
                              if (
                                !ownStructureToWithdraw.id ||
                                !ownStructureToWithdraw.withdraw?.shipId ||
                                !ownStructureToWithdraw.withdraw?.good ||
                                !ownStructureToWithdraw.withdraw?.quantity
                              ) {
                                return
                              }
                              handleWithdrawGoodsFromOwnStructure.mutate({
                                structureId: ownStructureToWithdraw.id,
                                shipId: ownStructureToWithdraw.withdraw?.shipId,
                                good: ownStructureToWithdraw.withdraw?.good,
                                quantity:
                                  ownStructureToWithdraw.withdraw?.quantity,
                              })
                            }}
                          >
                            {!handleWithdrawGoodsFromOwnStructure.isLoading ? (
                              `Withdraw ${
                                !!ownStructureToWithdraw.withdraw?.quantity &&
                                ownStructureToWithdraw.withdraw?.quantity > 0
                                  ? `${formatNumberCommas(
                                      ownStructureToWithdraw.withdraw?.quantity
                                    )} units`
                                  : ''
                              }`
                            ) : (
                              <>
                                Withdrawing goods
                                <div className="ml-2">
                                  <LoadingSpinner />
                                </div>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-center">
                      <div className="w-full py-4">
                        <div className="flex flex-col items-center text-center mb-4">
                          <h3 className="mt-2 text-sm font-medium text-gray-900">
                            No ships available to withdraw goods.
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Ships must be docked in this location to withdraw
                            goods.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            )}
          </>
        }
        onClose={() => {
          setOwnStructureToWithdraw(undefined)
        }}
        className="w-full md:max-w-xl"
      />
      <Modal
        open={!!structureToDeposit}
        title="Deposit Goods"
        content={
          <>
            {structureToDeposit && (
              <div className="mt-4 px-4 py-2">
                <form>
                  <div>
                    <h3 className="text-md font-medium text-gray-900">
                      Deposit Goods to{' '}
                      {
                        StructureCategory[
                          structureToDeposit.type as unknown as keyof typeof StructureCategory
                        ]
                      }
                    </h3>
                  </div>
                  <div className="flex items-center mt-2 py-1 text-sm leading-5 text-gray-500">
                    <span className="inline-flex items-center">
                      <span className="sr-only">Username</span>
                      <UserIcon className="mr-1 w-4 h-4 text-gray-900" />{' '}
                      {structureToDeposit.ownedBy.username}
                    </span>
                    <span className="ml-4 inline-flex items-center">
                      <span className="sr-only">Location</span>
                      <GlobeIcon className="mr-1 w-4 h-4 text-gray-900" />{' '}
                      {structureToDeposit.location}
                    </span>
                    <span className="ml-4 inline-flex items-center">
                      <span className="sr-only">Consumes</span>
                      <ArrowUpIcon className="mr-1 w-4 h-4 text-gray-900" />{' '}
                      {structureToDeposit.consumes
                        .map(
                          (c) => GoodType[c as unknown as keyof typeof GoodType]
                        )
                        .join(', ')}
                    </span>
                    <span className="ml-4 inline-flex items-center">
                      <span className="sr-only">Produces</span>
                      <ArrowDownIcon className="mr-1 w-4 h-4 text-gray-900" />{' '}
                      {structureToDeposit.produces
                        .map(
                          (c) => GoodType[c as unknown as keyof typeof GoodType]
                        )
                        .join(', ')}
                    </span>
                  </div>
                  {shipOptions.length > 0 ? (
                    <>
                      <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                          <Select
                            label="From Ship"
                            options={shipOptions}
                            value={structureToDeposit.deposit?.shipId}
                            onChange={(value) => {
                              setStructureToDeposit((prev) => {
                                if (!prev) {
                                  return
                                }
                                return {
                                  ...prev,
                                  deposit: {
                                    ...prev.deposit,
                                    shipId: value,
                                  },
                                }
                              })
                            }}
                          />
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                          <Select
                            label="Select Good"
                            options={
                              structureToDeposit.consumes.map((g) => ({
                                label:
                                  GoodType[
                                    g as unknown as keyof typeof GoodType
                                  ],
                                value: g,
                              })) ?? []
                            }
                            value={structureToDeposit.deposit?.good}
                            onChange={(value) => {
                              setStructureToDeposit((prev) => {
                                if (!prev) {
                                  return
                                }
                                return {
                                  ...prev,
                                  deposit: {
                                    ...prev.deposit,
                                    good: value as GoodType,
                                  },
                                }
                              })
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
                          <div className="mt-1">
                            <input
                              type="number"
                              name="quantity"
                              id="quantity"
                              min={1}
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              onChange={(e) => {
                                const quantity = !isNaN(
                                  parseInt(e.target.value)
                                )
                                  ? parseInt(e.target.value)
                                  : 0
                                setStructureToDeposit((prev) => {
                                  if (!prev) {
                                    return
                                  }
                                  return {
                                    ...prev,
                                    deposit: {
                                      ...prev.deposit,
                                      quantity,
                                    },
                                  }
                                })
                              }}
                            />
                          </div>
                        </div>
                        <div className="pt-6 sm:col-span-2">
                          <button
                            type="submit"
                            className={
                              'truncate inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' +
                              (structureToDeposit.deposit?.quantity === 0 ||
                              !structureToDeposit.deposit?.shipId ||
                              handleDepositGoodsToStructure.isLoading
                                ? ' opacity-50 cursor-not-allowed'
                                : '')
                            }
                            disabled={
                              structureToDeposit.deposit?.quantity === 0 ||
                              !structureToDeposit.deposit?.shipId ||
                              handleDepositGoodsToStructure.isLoading
                            }
                            onClick={(e) => {
                              e.preventDefault()
                              if (
                                !structureToDeposit.id ||
                                !structureToDeposit.deposit?.shipId ||
                                !structureToDeposit.deposit?.good ||
                                !structureToDeposit.deposit?.quantity
                              ) {
                                return
                              }
                              handleDepositGoodsToStructure.mutate({
                                structureId: structureToDeposit.id,
                                shipId: structureToDeposit.deposit?.shipId,
                                good: structureToDeposit.deposit?.good,
                                quantity: structureToDeposit.deposit?.quantity,
                              })
                            }}
                          >
                            {!handleDepositGoodsToStructure.isLoading ? (
                              `Deposit ${
                                !!structureToDeposit.deposit?.quantity &&
                                structureToDeposit.deposit?.quantity > 0
                                  ? `${formatNumberCommas(
                                      structureToDeposit.deposit?.quantity
                                    )} units`
                                  : ''
                              }`
                            ) : (
                              <>
                                Depositing goods
                                <div className="ml-2">
                                  <LoadingSpinner />
                                </div>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-center">
                      <div className="w-full py-4">
                        <div className="flex flex-col items-center text-center mb-4">
                          <h3 className="mt-2 text-sm font-medium text-gray-900">
                            No ships available to deposit goods.
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Ships must be docked in this location to deposit
                            goods.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            )}
          </>
        }
        onClose={() => setStructureToDeposit(undefined)}
        className="w-full md:max-w-xl"
      />
    </>
  )
}
