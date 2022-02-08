import { OfficeBuildingIcon } from '@heroicons/react/solid'
import moment from 'moment'
import { useMemo, useState } from 'react'
import { useQueries, useQuery, useQueryClient } from 'react-query'
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
import Modal from '../../components/Modal/index'
import Select from '../../components/Select'
import LoadingRows from '../../components/Table/LoadingRows'
import { System } from '../../types/Location'
import { GoodType } from '../../types/Order'
import { abbreviateNumber, formatNumberCommas } from '../../utils/helpers'

function Structures() {
  const [newStructure, setNewStructure] =
    useState<{ type?: string; location?: string }>()
  const [structureToQuery, setStructureToQuery] =
    useState<{ structureId?: string }>()
  const [ownStructureToDeposit, setOwnStructureToDeposit] = useState<{
    structureId?: string
    shipId?: string
    good?: string
    quantity?: number
  } | null>(null)
  const [ownStructureToWithdraw, setOwnStructureToWithdraw] = useState<{
    structureId?: string
    shipId?: string
    good?: string
    quantity?: number
  } | null>(null)
  const [structureToDeposit, setStructureToDeposit] = useState<{
    structureId?: string
    shipId?: string
    good?: string
    quantity?: number
  } | null>(null)

  const queryClient = useQueryClient()
  const myShips = useQuery('myShips', listMyShips)
  const allMyStructures = useQuery('myStructures', listMyStructures)
  const structure = useQuery(
    ['structure', structureToQuery?.structureId],
    () => getStructureInfo(structureToQuery?.structureId ?? ''),
    {
      enabled: !!structureToQuery?.structureId,
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

  const handleCreateStructure = async (location: string, type: string) => {
    try {
      const response = createNewStructure(location, type)
      console.log(response)
      queryClient.invalidateQueries('myStructures')
    } catch (error) {
      console.error(error)
    }
  }

  const handleDepositGoodsToOwnStructure = async (
    structureId: string,
    shipId: string,
    good: string,
    quantity: number
  ) => {
    try {
      const response = await depositToMyStructure(
        structureId,
        shipId,
        good,
        quantity
      )
      console.log(response)
      queryClient.invalidateQueries('myStructures')
    } catch (error) {
      console.error(error)
    }
  }

  const handleWithdrawGoodsFromOwnStructure = async (
    structureId: string,
    shipId: string,
    good: string,
    quantity: number
  ) => {
    try {
      const response = await withdrawFromMyStructure(
        structureId,
        shipId,
        good,
        quantity
      )
      console.log(response)
      queryClient.invalidateQueries('myStructures')
    } catch (error) {
      console.error(error)
    }
  }

  const handleDepositGoodsToStructure = async (
    structureId: string,
    shipId: string,
    good: string,
    quantity: number
  ) => {
    try {
      const response = await depositToStructure(
        structureId,
        shipId,
        good,
        quantity
      )
      console.log(response)
      queryClient.invalidateQueries('myStructures')
    } catch (error) {
      console.error(error)
    }
  }

  const structureTypeOptions =
    structureTypes.data?.structures.map((s) => ({
      value: s.type,
      label: s.name,
      tags: [
        `💰 ${abbreviateNumber(s.price)}`,
        // @ts-expect-error
        `${s.consumes.map((c) => GoodType[c]).join(', ')} → ${s.produces
          // @ts-expect-error
          .map((p) => GoodType[p])
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
    myShips.data?.ships.map((s) => ({
      value: s.id,
      label: `${s.type} (${s.maxCargo - s.spaceAvailable}/${s.maxCargo})`,
    })) ?? []

  return (
    <>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Structures</h1>
        </div>
      </header>
      <main>
        <div className="bg-gray-100 min-h-screen">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto py-6">
              <h2 className="text-2xl font-bold text-gray-900">
                My Structures
              </h2>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
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
                              'inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' +
                              (newStructure?.type && newStructure?.location
                                ? ''
                                : ' opacity-50 cursor-not-allowed')
                            }
                            disabled={
                              !(newStructure?.type && newStructure?.location)
                            }
                            onClick={(e) => {
                              e.preventDefault()
                              if (
                                !newStructure?.location ||
                                !newStructure.type
                              ) {
                                return
                              }
                              handleCreateStructure(
                                newStructure.location,
                                newStructure.type
                              )
                            }}
                          >
                            Create{' '}
                            {newStructure?.type &&
                              `for ${formatNumberCommas(
                                structureTypes.data?.structures.find(
                                  (s) => s.type === newStructure.type
                                )?.price ?? 0
                              )} credits`}
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
                    {allMyStructures.data &&
                    allMyStructures.data.structures.length > 0 ? (
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
                            allMyStructures.data.structures.map(
                              (structure, i) => (
                                <tr
                                  key={structure.id}
                                  className={
                                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                  }
                                >
                                  <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 font-medium text-gray-900">
                                    {structure.type}
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
                                          `${good} (${
                                            structure.inventory.find(
                                              (item) => item.good === good
                                            )?.quantity ?? 0
                                          })`
                                      )
                                      .join(', ')}
                                  </td>
                                  <td className="px-6 py-4 text-sm leading-5 text-gray-500">
                                    {structure.produces
                                      .map(
                                        (good) =>
                                          `${good} (${
                                            structure.inventory.find(
                                              (item) => item.good === good
                                            )?.quantity ?? 0
                                          })`
                                      )
                                      .join(', ')}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                      className="text-indigo-600 hover:text-indigo-900"
                                      onClick={() => {
                                        setOwnStructureToDeposit((prev) => ({
                                          ...prev,
                                          structureId: structure.id,
                                        }))
                                      }}
                                    >
                                      Deposit
                                    </button>
                                    <button
                                      className="ml-4 text-indigo-600 hover:text-indigo-900"
                                      onClick={() => {
                                        setOwnStructureToWithdraw((prev) => ({
                                          ...prev,
                                          structureId: structure.id,
                                        }))
                                      }}
                                    >
                                      Withdraw
                                    </button>
                                  </td>
                                </tr>
                              )
                            )
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
                              Create a structure to start generating your own
                              goods.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto py-6">
              <h2 className="text-2xl font-bold text-gray-900">
                All Structures
              </h2>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
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
                      <div className="p-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-1">
                        <div className="sm:col-span-1">
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

                    {!structure.isLoading ? (
                      structure.data && (
                        <>
                          <div className="px-4 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                              Structure Details
                            </h3>
                          </div>
                          <div className="px-6 py-4 bg-white">
                            <p className="text-gray-900">
                              {structure.data.structure.name}
                            </p>
                            <p className="text-gray-500">
                              {structure.data.structure.completed
                                ? 'Completed'
                                : 'Not Completed'}
                            </p>
                            <p className="text-gray-500">
                              Stability {structure.data.structure.stability}
                            </p>
                            {structure.data.structure.materials.map(
                              (material, i) => (
                                <div key={i} className="mt-1">
                                  <p className="text-gray-500">
                                    Good: {material.good}
                                  </p>
                                  <p className="text-gray-500">
                                    Quantity:{' '}
                                    {formatNumberCommas(material.quantity)}
                                  </p>
                                  <p className="text-gray-500">
                                    Target quantity:{' '}
                                    {formatNumberCommas(
                                      material.targetQuantity
                                    )}
                                  </p>
                                </div>
                              )
                            )}
                            <button
                              className="mt-1 text-indigo-600 hover:text-indigo-900"
                              onClick={() => {
                                setStructureToDeposit((prev) => ({
                                  ...prev,
                                  structureId: structure.data.structure.id,
                                }))
                              }}
                            >
                              Deposit
                            </button>
                          </div>
                        </>
                      )
                    ) : (
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Modal
        open={!!ownStructureToDeposit}
        title="Deposit Goods"
        content={
          <>
            {ownStructureToDeposit && (
              <div className="mt-4 px-4 py-2">
                {' '}
                <div className="sm:col-span-3">
                  <Select
                    label="Good"
                    options={
                      allMyStructures.data?.structures
                        .find((s) => s.id === ownStructureToDeposit.structureId)
                        ?.consumes.map((g) => ({
                          label: g,
                          value: g,
                        })) ?? []
                    }
                    value={ownStructureToDeposit.good}
                    onChange={(value) => {
                      setOwnStructureToDeposit((prev) => ({
                        ...prev,
                        good: value,
                      }))
                    }}
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <input
                    className="mt-1 form-input w-full"
                    type="number"
                    min={1}
                    // max={} // ship quantity
                    onChange={(e) =>
                      setOwnStructureToDeposit((prev) => ({
                        ...prev,
                        quantity: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="sm:col-span-3">
                  <Select
                    label="From Ship"
                    options={shipOptions}
                    value={ownStructureToDeposit.shipId}
                    onChange={(value) => {
                      setOwnStructureToDeposit((prev) => ({
                        ...prev,
                        shipId: value,
                      }))
                    }}
                  />
                </div>
                <button
                  className="m-4"
                  onClick={() => setOwnStructureToDeposit(null)}
                >
                  Cancel
                </button>
                <button
                  className="m-4"
                  onClick={() => {
                    if (
                      !ownStructureToDeposit?.structureId ||
                      !ownStructureToDeposit?.shipId ||
                      !ownStructureToDeposit?.good ||
                      !ownStructureToDeposit?.quantity
                    ) {
                      return
                    }
                    handleDepositGoodsToOwnStructure(
                      ownStructureToDeposit.structureId,
                      ownStructureToDeposit.shipId,
                      ownStructureToDeposit.good,
                      ownStructureToDeposit.quantity
                    )
                  }}
                >
                  Deposit
                </button>
              </div>
            )}
          </>
        }
        onClose={() => setOwnStructureToDeposit(null)}
      />
      <Modal
        open={!!ownStructureToWithdraw}
        title="Withdraw Goods"
        content={
          <>
            {ownStructureToWithdraw && (
              <div className="mt-4 px-4 py-2">
                {' '}
                <div className="sm:col-span-3">
                  <Select
                    label="Good"
                    options={
                      allMyStructures.data?.structures
                        .find(
                          (s) => s.id === ownStructureToWithdraw.structureId
                        )
                        ?.produces.map((g) => ({
                          label: g,
                          value: g,
                        })) ?? []
                    }
                    value={ownStructureToWithdraw.good}
                    onChange={(value) => {
                      setOwnStructureToWithdraw((prev) => ({
                        ...prev,
                        good: value,
                      }))
                    }}
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <input
                    className="mt-1 form-input w-full"
                    type="number"
                    min={1}
                    // max={} // structure quantity
                    onChange={(e) =>
                      setOwnStructureToWithdraw((prev) => ({
                        ...prev,
                        quantity: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="sm:col-span-3">
                  <Select
                    label="To Ship"
                    options={shipOptions}
                    value={ownStructureToWithdraw.shipId}
                    onChange={(value) => {
                      setOwnStructureToWithdraw((prev) => ({
                        ...prev,
                        shipId: value,
                      }))
                    }}
                  />
                </div>
                <button
                  className="m-4"
                  onClick={() => setOwnStructureToWithdraw(null)}
                >
                  Cancel
                </button>
                <button
                  className="m-4"
                  onClick={() => {
                    if (
                      !ownStructureToWithdraw?.structureId ||
                      !ownStructureToWithdraw?.shipId ||
                      !ownStructureToWithdraw?.good ||
                      !ownStructureToWithdraw?.quantity
                    ) {
                      return
                    }
                    handleWithdrawGoodsFromOwnStructure(
                      ownStructureToWithdraw.structureId,
                      ownStructureToWithdraw.shipId,
                      ownStructureToWithdraw.good,
                      ownStructureToWithdraw.quantity
                    )
                  }}
                >
                  Withdraw
                </button>
              </div>
            )}
          </>
        }
        onClose={() => {
          setOwnStructureToWithdraw(null)
        }}
      />
      <Modal
        open={!!structureToDeposit}
        title="Deposit Goods"
        content={
          <>
            {structureToDeposit && (
              <div className="mt-4 px-4 py-2">
                {' '}
                <div className="sm:col-span-3">
                  <Select
                    label="Good"
                    options={
                      structure.data?.structure.materials.map((g) => ({
                        label: `${g.good} (${formatNumberCommas(
                          g.quantity
                        )}/${formatNumberCommas(g.targetQuantity)})`,
                        value: g.good,
                      })) ?? []
                    }
                    value={structureToDeposit.good}
                    onChange={(value) => {
                      setStructureToDeposit((prev) => ({
                        ...prev,
                        good: value,
                      }))
                    }}
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <input
                    className="mt-1 form-input w-full"
                    type="number"
                    min={1}
                    // max={} // ship quantity
                    onChange={(e) =>
                      setStructureToDeposit((prev) => ({
                        ...prev,
                        quantity: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="sm:col-span-3">
                  <Select
                    label="From Ship"
                    options={shipOptions}
                    value={structureToDeposit.shipId}
                    onChange={(value) => {
                      setStructureToDeposit((prev) => ({
                        ...prev,
                        shipId: value,
                      }))
                    }}
                  />
                </div>
                <button
                  className="m-4"
                  onClick={() => setStructureToDeposit(null)}
                >
                  Cancel
                </button>
                <button
                  className="m-4"
                  onClick={() => {
                    if (
                      !structureToDeposit?.structureId ||
                      !structureToDeposit?.shipId ||
                      !structureToDeposit?.good ||
                      !structureToDeposit?.quantity
                    ) {
                      return
                    }
                    handleDepositGoodsToStructure(
                      structureToDeposit.structureId,
                      structureToDeposit.shipId,
                      structureToDeposit.good,
                      structureToDeposit.quantity
                    )
                  }}
                >
                  Deposit
                </button>
              </div>
            )}
          </>
        }
        onClose={() => setStructureToDeposit(null)}
      />
    </>
  )
}

export default Structures
