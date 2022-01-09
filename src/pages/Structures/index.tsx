import React, { useState, useEffect } from 'react'
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
import SimpleModal from '../../components/Modal/SimpleModal'
import SelectMenu from '../../components/SelectMenu'
import { ListShipsResponse } from '../../types/Ship'
import {
  ListOwnStructuresResponse,
  ListStructureTypesResponse,
  StructureResponse,
} from '../../types/Structure'
import { ListSystemLocationsResponse } from '../../types/System'
import { formatThousands } from '../../utils/helpers'

const START_CURRENT_SYSTEM = 'OE'

function Structures() {
  const [allMyStructures, setAllMyStructures] =
    useState<ListOwnStructuresResponse>()
  const [availableLocations, setAvailableLocations] =
    useState<ListSystemLocationsResponse>()
  const [myShips, setMyShips] = useState<ListShipsResponse>()

  const [newStructure, setNewStructure] =
    useState<{ location?: string; type?: string }>()
  const [structureToQuery, setStructureToQuery] =
    useState<{ structureId?: string }>()
  const [structureInfo, setStructureInfo] = useState<
    StructureResponse | string | undefined
  >()
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

  const [structureTypes, setStructureTypes] =
    useState<ListStructureTypesResponse>()

  useEffect(() => {
    const init = async () => {
      setAllMyStructures(await listMyStructures())
      setStructureTypes(await listStructureTypes())
      setAvailableLocations(await getSystemLocations(START_CURRENT_SYSTEM))
      setMyShips(await listMyShips())
    }
    init()
  }, [])

  const handleCreateStructure = async (location: string, type: string) => {
    try {
      const response = createNewStructure(location, type)
      console.log(response)
      setAllMyStructures(await listMyStructures())
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
      setAllMyStructures(await listMyStructures())
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
      setAllMyStructures(await listMyStructures())
    } catch (error) {
      console.error(error)
    }
  }

  const handleQueryStructure = async (structureId: string) => {
    try {
      setStructureInfo(undefined)
      const response = await getStructureInfo(structureId)
      if (!response) {
        setStructureInfo('No structure found')
        return
      }
      setStructureInfo(response)
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
      setStructureInfo(await getStructureInfo(structureId))
    } catch (error) {
      console.error(error)
    }
  }

  const locationOptions = availableLocations?.locations
    .filter((l) => l.allowsConstruction)
    ?.map((location) => ({
      value: location.symbol,
      label: `${location.name} (${location.symbol})`,
    }))

  const structureTypeOptions = structureTypes?.structures.map((structure) => ({
    value: structure.type,
    label: `${structure.type} (${formatThousands(structure.price)})`,
  }))

  const shipOptions = myShips?.ships.map((ship) => ({
    value: ship.id,
    label: `${ship.type} (${ship.maxCargo - ship.spaceAvailable}/${
      ship.maxCargo
    })`,
  }))

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
              </div>
              <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg"></div>
                    <form className="min-w-full divide-y divide-gray-200">
                      <div className="p-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-2">
                          {locationOptions && (
                            <SelectMenu
                              label="Select Location"
                              options={locationOptions}
                              onChange={(value) => {
                                setNewStructure((prev) => ({
                                  ...prev,
                                  location: value,
                                }))
                              }}
                            />
                          )}
                        </div>
                        <div className="sm:col-span-2">
                          {structureTypeOptions && (
                            <SelectMenu
                              label="Select Structure Type"
                              options={structureTypeOptions}
                              onChange={(value) => {
                                setNewStructure((prev) => ({
                                  ...prev,
                                  type: value,
                                }))
                              }}
                            />
                          )}
                        </div>
                        <div className="sm:col-span-2 pt-6">
                          <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                  Structures
                </h3>
              </div>
              <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                      {allMyStructures &&
                      allMyStructures.structures.length > -1 ? (
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
                            {allMyStructures.structures.map((structure, i) => (
                              <tr
                                key={structure.id}
                                className={
                                  i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                }
                              >
                                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 font-medium text-gray-900">
                                  {structure.type}
                                </td>
                                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                  {structure.location}
                                </td>
                                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
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
                                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                  {structure.status}
                                </td>
                                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
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
                                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
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
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="px-6 py-4 bg-white text-center">
                          <p className="text-gray-500">
                            You don't have any structures yet
                          </p>
                        </div>
                      )}
                    </div>
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
                                  structureId: e.target.value,
                                })
                              }}
                            />
                          </div>
                        </div>
                        <div className="sm:col-span-2 pt-6">
                          <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={(e) => {
                              e.preventDefault()
                              if (!structureToQuery?.structureId) {
                                return
                              }
                              handleQueryStructure(structureToQuery.structureId)
                            }}
                          >
                            Create
                          </button>
                        </div>
                      </div>
                    </form>

                    {structureInfo && (
                      <>
                        <div className="px-4 sm:px-6">
                          <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Structure Details
                          </h3>
                        </div>
                        {typeof structureInfo === 'string' ? (
                          <div className="px-6 py-4 bg-white text-center text-gray-900">
                            <p className="text-gray-500">{structureInfo}</p>
                          </div>
                        ) : (
                          <div className="px-6 py-4 bg-white">
                            <p className="text-gray-900">
                              {structureInfo.structure.name}
                            </p>
                            <p className="text-gray-500">
                              {structureInfo.structure.completed
                                ? 'Completed'
                                : 'Not Completed'}
                            </p>
                            <p className="text-gray-500">
                              Stability {structureInfo.structure.stability}
                            </p>
                            {structureInfo.structure.materials.map(
                              (material, i) => (
                                <div key={i} className="mt-1">
                                  <p className="text-gray-500">
                                    Good: {material.good}
                                  </p>
                                  <p className="text-gray-500">
                                    Quantity:{' '}
                                    {formatThousands(material.quantity)}
                                  </p>
                                  <p className="text-gray-500">
                                    Target quantity:{' '}
                                    {formatThousands(material.targetQuantity)}
                                  </p>
                                </div>
                              )
                            )}
                            <button
                              className="mt-1 text-indigo-600 hover:text-indigo-900"
                              onClick={() => {
                                setStructureToDeposit((prev) => ({
                                  ...prev,
                                  structureId: structureInfo.structure.id,
                                }))
                              }}
                            >
                              Deposit
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {ownStructureToDeposit && (
        <SimpleModal
          title="Deposit Goods"
          content={
            <div>
              <div className="sm:col-span-3">
                {allMyStructures && (
                  <SelectMenu
                    label="Good"
                    options={
                      allMyStructures.structures
                        .find((s) => s.id === ownStructureToDeposit.structureId)
                        ?.consumes.map((g) => ({
                          label: g,
                          value: g,
                        })) ?? []
                    }
                    onChange={(value) => {
                      setOwnStructureToDeposit((prev) => ({
                        ...prev,
                        good: value,
                      }))
                    }}
                  />
                )}
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
                {shipOptions && (
                  <SelectMenu
                    label="From Ship"
                    options={shipOptions}
                    onChange={(value) => {
                      setOwnStructureToDeposit((prev) => ({
                        ...prev,
                        shipId: value,
                      }))
                    }}
                  />
                )}
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
          }
          handleClose={() => setOwnStructureToDeposit(null)}
        />
      )}
      {ownStructureToWithdraw && (
        <SimpleModal
          title="Withdraw Goods"
          content={
            <div>
              <div className="sm:col-span-3">
                {allMyStructures && (
                  <SelectMenu
                    label="Good"
                    options={
                      allMyStructures.structures
                        .find(
                          (s) => s.id === ownStructureToWithdraw.structureId
                        )
                        ?.produces.map((g) => ({
                          label: g,
                          value: g,
                        })) ?? []
                    }
                    onChange={(value) => {
                      setOwnStructureToWithdraw((prev) => ({
                        ...prev,
                        good: value,
                      }))
                    }}
                  />
                )}
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
                {shipOptions && (
                  <SelectMenu
                    label="To Ship"
                    options={shipOptions}
                    onChange={(value) => {
                      setOwnStructureToWithdraw((prev) => ({
                        ...prev,
                        shipId: value,
                      }))
                    }}
                  />
                )}
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
          }
          handleClose={() => {
            setOwnStructureToWithdraw(null)
          }}
        />
      )}
      {structureToDeposit && (
        <SimpleModal
          title="Deposit Goods"
          content={
            <div>
              <div className="sm:col-span-3">
                {structureInfo && typeof structureInfo === 'object' && (
                  <SelectMenu
                    label="Good"
                    options={
                      structureInfo.structure.materials.map((g) => ({
                        label: `${g.good} (${formatThousands(
                          g.quantity
                        )}/${formatThousands(g.targetQuantity)})`,
                        value: g.good,
                      })) ?? []
                    }
                    onChange={(value) => {
                      setStructureToDeposit((prev) => ({
                        ...prev,
                        good: value,
                      }))
                    }}
                  />
                )}
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
                {shipOptions && (
                  <SelectMenu
                    label="From Ship"
                    options={shipOptions}
                    onChange={(value) => {
                      setStructureToDeposit((prev) => ({
                        ...prev,
                        shipId: value,
                      }))
                    }}
                  />
                )}
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
          }
          handleClose={() => setStructureToDeposit(null)}
        />
      )}
    </>
  )
}

export default Structures
