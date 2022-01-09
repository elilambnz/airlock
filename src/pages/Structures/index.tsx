import React, { useState, useEffect } from 'react'
import {
  createNewStructure,
  depositToMyStructure,
  getMyStructureInfo,
  listMyStructures,
  withdrawFromMyStructure,
} from '../../api/routes/my'
import {
  depositToStructure,
  getStructureInfo,
} from '../../api/routes/structures'
import { getSystemLocations } from '../../api/routes/systems'
import { listStructureTypes } from '../../api/routes/types'
import '../../App.css'
import SelectMenu from '../../components/SelectMenu'
import {
  ListOwnStructuresResponse,
  ListStructureTypesResponse,
  OwnStructureResponse,
  OwnStructureWithdrawResponse,
  OwnStrucutreDepositResponse,
  StructureResponse,
  StrucutreDepositResponse,
} from '../../types/Structure'
import { ListSystemLocationsResponse } from '../../types/System'

const START_CURRENT_SYSTEM = 'OE'

function Structures() {
  const [allMyStructures, setAllMyStructures] =
    useState<ListOwnStructuresResponse>()
  const [availableLocations, setAvailableLocations] =
    useState<ListSystemLocationsResponse>()
  const [myStructureInfoForm, setMyStructureInfoForm] = useState({
    structureId: '',
  })
  const [myStructureInfo, setMyStructureInfo] = useState<OwnStructureResponse>()
  const [structureCreateForm, setStructureCreateForm] = useState({
    location: '',
    type: '',
  })
  const [newStructure, setNewStructure] =
    useState<{ location?: string; type?: string }>()
  const [structureCreate, setStructureCreate] = useState<OwnStructureResponse>()
  const [myStructureDepositForm, setMyStructureDepositForm] = useState({
    structureId: '',
    shipId: '',
    good: '',
    quantity: 0,
  })
  const [myStructureDeposit, setMyStructureDeposit] =
    useState<OwnStrucutreDepositResponse>()
  const [myStructureWithdrawForm, setMyStructureWithdrawForm] = useState({
    structureId: '',
    shipId: '',
    good: '',
    quantity: 0,
  })
  const [myStructureWithdraw, setMyStructureWithdraw] =
    useState<OwnStructureWithdrawResponse>()
  const [structureInfoForm, setStructureInfoForm] = useState({
    structureId: '',
  })
  const [structureInfo, setStructureInfo] = useState<StructureResponse>()
  const [structureDepositForm, setStructureDepositForm] = useState({
    structureId: '',
    shipId: '',
    good: '',
    quantity: 0,
  })
  const [structureDeposit, setStructureDeposit] =
    useState<StrucutreDepositResponse>()
  const [structureTypes, setStructureTypes] =
    useState<ListStructureTypesResponse>()

  useEffect(() => {
    const init = async () => {
      setAllMyStructures(await listMyStructures())
      setStructureTypes(await listStructureTypes())
      setAvailableLocations(await getSystemLocations(START_CURRENT_SYSTEM))
    }
    init()
  }, [])

  const handleSubmitMyStructureInfoForm = async (e: any) => {
    e.preventDefault()
    setMyStructureInfo(
      await getMyStructureInfo(myStructureInfoForm.structureId)
    )
  }

  const handleSubmitStructureCreateForm = async (e: any) => {
    e.preventDefault()
    setStructureCreate(
      await createNewStructure(
        structureCreateForm.location,
        structureCreateForm.type
      )
    )
  }

  const handleSubmitMyStructureDepositForm = async (e: any) => {
    e.preventDefault()
    setMyStructureDeposit(
      await depositToMyStructure(
        myStructureDepositForm.structureId,
        myStructureDepositForm.shipId,
        myStructureDepositForm.good,
        myStructureDepositForm.quantity
      )
    )
  }

  const handleSubmitMyStructureWithdrawForm = async (e: any) => {
    e.preventDefault()
    setMyStructureWithdraw(
      await withdrawFromMyStructure(
        myStructureWithdrawForm.structureId,
        myStructureWithdrawForm.shipId,
        myStructureWithdrawForm.good,
        myStructureWithdrawForm.quantity
      )
    )
  }

  const handleSubmitStructureInfoForm = async (e: any) => {
    e.preventDefault()
    setStructureInfo(await getStructureInfo(structureInfoForm.structureId))
  }

  const handleSubmitStructureDepositForm = async (e: any) => {
    e.preventDefault()
    setStructureDeposit(
      await depositToStructure(
        structureDepositForm.structureId,
        structureDepositForm.shipId,
        structureDepositForm.good,
        structureDepositForm.quantity
      )
    )
  }

  const handleCreateStructure = async (location: string, type: string) => {
    try {
      const response = createNewStructure(location, type)
      console.log(response)
      setAllMyStructures(await listMyStructures())
    } catch (error) {
      console.error(error)
    }
  }

  const locationOptions = availableLocations?.locations
    // .filter((l) => l.allowsConstruction)
    ?.map((location) => ({
      value: location.symbol,
      label: `${location.name} (${location.symbol})`,
    }))

  const structureTypeOptions = structureTypes?.structures.map((structure) => ({
    value: structure.type,
    label: structure.type,
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
                                setNewStructure({
                                  ...newStructure,
                                  location: value,
                                })
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
                                setNewStructure({
                                  ...newStructure,
                                  type: value,
                                })
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

            <div className="flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    {allMyStructures &&
                    allMyStructures.structures.length > 0 ? (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
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
                              <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 font-medium text-gray-900">
                                {structure.status}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  className="text-indigo-600 hover:text-indigo-900"
                                  onClick={() => {
                                    // handleDepositToStructure()
                                  }}
                                >
                                  Deposit
                                </button>
                                <button
                                  className="text-indigo-600 hover:text-indigo-900"
                                  onClick={() => {
                                    // handleWithdrawToStructure()
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
                          You don't have any structures yet.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <div className="App">
        <header className="App-header">
          <h1>Structures</h1>
          <h2>My structures</h2>
          <code>
            <pre>{JSON.stringify(allMyStructures, undefined, 2)}</pre>
          </code>
          <form onSubmit={handleSubmitMyStructureInfoForm}>
            <p>Get my structure info</p>
            <input
              type="text"
              name="structureId"
              placeholder="Structure ID"
              value={myStructureInfoForm.structureId}
              onChange={(e) =>
                setMyStructureInfoForm((prev) => ({
                  ...prev,
                  structureId: e.target.value,
                }))
              }
            />
            <button type="submit">Submit</button>
          </form>
          <p>Result</p>
          <code>
            <pre>{JSON.stringify(myStructureInfo, undefined, 2)}</pre>
          </code>
          <form onSubmit={handleSubmitStructureCreateForm}>
            <p>Create structure</p>
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={structureCreateForm.location}
              onChange={(e) =>
                setStructureCreateForm((prev) => ({
                  ...prev,
                  location: e.target.value,
                }))
              }
            />
            <input
              type="text"
              name="type"
              placeholder="Type"
              value={structureCreateForm.type}
              onChange={(e) =>
                setStructureCreateForm((prev) => ({
                  ...prev,
                  type: e.target.value,
                }))
              }
            />
            <button type="submit">Submit</button>
          </form>
          <p>Result</p>
          <code>
            <pre>{JSON.stringify(structureCreate, undefined, 2)}</pre>
          </code>
          <form onSubmit={handleSubmitMyStructureDepositForm}>
            <p>Deposit to my structure</p>
            <input
              type="text"
              name="structureId"
              placeholder="Structure ID"
              value={myStructureDepositForm.structureId}
              onChange={(e) =>
                setMyStructureDepositForm((prev) => ({
                  ...prev,
                  structureId: e.target.value,
                }))
              }
            />
            <input
              type="text"
              name="shipId"
              placeholder="Ship ID"
              value={myStructureDepositForm.shipId}
              onChange={(e) =>
                setMyStructureDepositForm((prev) => ({
                  ...prev,
                  shipId: e.target.value,
                }))
              }
            />
            <input
              type="text"
              name="good"
              placeholder="Good"
              value={myStructureDepositForm.good}
              onChange={(e) =>
                setMyStructureDepositForm((prev) => ({
                  ...prev,
                  good: e.target.value,
                }))
              }
            />
            <input
              type="text"
              name="quantity"
              placeholder="Quantity"
              value={myStructureDepositForm.quantity}
              onChange={(e) =>
                setMyStructureDepositForm((prev) => ({
                  ...prev,
                  quantity: Number(e.target.value),
                }))
              }
            />
            <button type="submit">Deposit</button>
          </form>
          <p>Result</p>
          <code>
            <pre>{JSON.stringify(myStructureDeposit, undefined, 2)}</pre>
          </code>
          <form onSubmit={handleSubmitMyStructureWithdrawForm}>
            <p>Withdraw from my structure</p>
            <input
              type="text"
              name="structureId"
              placeholder="Structure ID"
              value={myStructureWithdrawForm.structureId}
              onChange={(e) =>
                setMyStructureWithdrawForm((prev) => ({
                  ...prev,
                  structureId: e.target.value,
                }))
              }
            />
            <input
              type="text"
              name="shipId"
              placeholder="Ship ID"
              value={myStructureWithdrawForm.shipId}
              onChange={(e) =>
                setMyStructureWithdrawForm((prev) => ({
                  ...prev,
                  shipId: e.target.value,
                }))
              }
            />
            <input
              type="text"
              name="good"
              placeholder="Good"
              value={myStructureWithdrawForm.good}
              onChange={(e) =>
                setMyStructureWithdrawForm((prev) => ({
                  ...prev,
                  good: e.target.value,
                }))
              }
            />
            <input
              type="text"
              name="quantity"
              placeholder="Quantity"
              value={myStructureWithdrawForm.quantity}
              onChange={(e) =>
                setMyStructureWithdrawForm((prev) => ({
                  ...prev,
                  quantity: Number(e.target.value),
                }))
              }
            />
            <button type="submit">Withdraw</button>
          </form>
          <p>Result</p>
          <code>
            <pre>{JSON.stringify(myStructureWithdraw, undefined, 2)}</pre>
          </code>
          <h2>Other structures</h2>
          <form onSubmit={handleSubmitStructureInfoForm}>
            <p>Get structure info</p>
            <input
              type="text"
              name="structureId"
              placeholder="Structure ID"
              value={structureInfoForm.structureId}
              onChange={(e) =>
                setStructureInfoForm((prev) => ({
                  ...prev,
                  structureId: e.target.value,
                }))
              }
            />
            <button type="submit">Submit</button>
          </form>
          <p>Result</p>
          <code>
            <pre>{JSON.stringify(structureInfo, undefined, 2)}</pre>
          </code>
          <form onSubmit={handleSubmitStructureDepositForm}>
            <p>Deposit to a structure</p>
            <input
              type="text"
              name="structureId"
              placeholder="Structure ID"
              value={structureDepositForm.structureId}
              onChange={(e) =>
                setStructureDepositForm((prev) => ({
                  ...prev,
                  structureId: e.target.value,
                }))
              }
            />
            <input
              type="text"
              name="shipId"
              placeholder="Ship ID"
              value={structureDepositForm.shipId}
              onChange={(e) =>
                setStructureDepositForm((prev) => ({
                  ...prev,
                  shipId: e.target.value,
                }))
              }
            />
            <input
              type="text"
              name="good"
              placeholder="Good"
              value={structureDepositForm.good}
              onChange={(e) =>
                setStructureDepositForm((prev) => ({
                  ...prev,
                  good: e.target.value,
                }))
              }
            />
            <input
              type="text"
              name="quantity"
              placeholder="Quantity"
              value={structureDepositForm.quantity}
              onChange={(e) =>
                setStructureDepositForm((prev) => ({
                  ...prev,
                  quantity: Number(e.target.value),
                }))
              }
            />
            <button type="submit">Deposit</button>
          </form>
          <p>Result</p>
          <code>
            <pre>{JSON.stringify(structureDeposit, undefined, 2)}</pre>
          </code>
          <h2>Structure types</h2>
          <details>
            <summary>Show all</summary>
            <code>
              <pre>{JSON.stringify(structureTypes, undefined, 2)}</pre>
            </code>
          </details>
        </header>
      </div>
    </>
  )
}

export default Structures
