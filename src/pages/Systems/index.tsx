import React, { useState, useEffect } from 'react'
import { createNewFlightPlan, listMyShips } from '../../api/routes/my'
import {
  getSystemDockedShips,
  getSystemFlightPlans,
  getSystemInfo,
  getSystemLocations,
} from '../../api/routes/systems'
import '../../App.css'
import SelectMenu from '../../components/SelectMenu'
import { ListShipsResponse } from '../../types/Ship'
import {
  ListSystemFlightPlansResponse,
  ListSystemLocationsResponse,
  SystemDockedShipsResponse,
  SystemsResponse,
} from '../../types/System'
import moment from 'moment'
import LoadingRows from '../../components/Table/LoadingRows'

const START_CURRENT_SYSTEM = 'OE'

function Systems() {
  const [currentSystem, setCurrentSystem] = useState<SystemsResponse>()
  const [availableLocations, setAvailableLocations] =
    useState<ListSystemLocationsResponse>()
  const [allFlightPlans, setAllFlightPlans] =
    useState<ListSystemFlightPlansResponse>()
  const [allDockedShips, setAllDockedShips] =
    useState<SystemDockedShipsResponse>()
  const [myShips, setMyShips] = useState<ListShipsResponse>()
  const [newFlightPlan, setNewFlightPlan] =
    useState<{ shipId?: string; destination?: string }>()

  const updateCurrentSystem = async (systemSymbol: string) => {
    setCurrentSystem(await getSystemInfo(systemSymbol))
    setAvailableLocations(await getSystemLocations(systemSymbol))
  }

  useEffect(() => {
    updateCurrentSystem(START_CURRENT_SYSTEM)

    const init = async () => {
      setAllFlightPlans(await getSystemFlightPlans(START_CURRENT_SYSTEM))
      setAllDockedShips(await getSystemDockedShips(START_CURRENT_SYSTEM))
      setMyShips(await listMyShips())
    }
    init()
  }, [])

  const handleCreateFlightPlan = async (
    shipId: string,
    destination: string
  ) => {
    try {
      const result = await createNewFlightPlan(shipId, destination)
      console.log(result)
      setAllFlightPlans(await getSystemFlightPlans(START_CURRENT_SYSTEM))
    } catch (error) {
      console.error(error)
    }
  }

  const shipOptions = myShips?.ships.map((ship) => ({
    value: ship.id,
    label: `${ship.type} (${ship.location})`,
  }))

  const locationOptions = availableLocations?.locations.map((location) => ({
    value: location.symbol,
    label: `${location.name} (${location.symbol})`,
  }))

  const myActiveFlightPlans = allFlightPlans?.flightPlans.filter(
    (flightPlan) => flightPlan.username === process.env.REACT_APP_USERNAME
  )

  const myDockedShips = allDockedShips?.ships.filter(
    (ship) => ship.username === process.env.REACT_APP_USERNAME
  )

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
            <div className="max-w-7xl mx-auto py-6">
              <h2 className="text-2xl font-bold text-gray-900">Locations</h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {currentSystem &&
                  `${currentSystem?.system.symbol} - ${currentSystem?.system.name}`}
              </p>
            </div>

            <div className="flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    {
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
                                  key={location.name}
                                  className={
                                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                  }
                                >
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 font-medium text-gray-900">
                                    {location.name}
                                  </td>
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                    {location.symbol}
                                  </td>
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                    {location.type}
                                  </td>
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                    {location.traits?.join(', ')}
                                  </td>
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                    {location.allowsConstruction ? 'Yes' : 'No'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                    ({location.x}, {location.y})
                                  </td>
                                </tr>
                              ))
                          ) : (
                            <LoadingRows cols={6} />
                          )}
                        </tbody>
                      </table>
                    }
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto py-6">
              <h2 className="text-2xl font-bold text-gray-900">Flight Plans</h2>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Create New Flight Plan
                </h3>
              </div>
              <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg"></div>
                    <form className="min-w-full divide-y divide-gray-200">
                      <div className="p-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-2">
                          {shipOptions && (
                            <SelectMenu
                              label="Select Ship"
                              options={shipOptions}
                              onChange={(value) => {
                                setNewFlightPlan({
                                  ...newFlightPlan,
                                  shipId: value,
                                })
                              }}
                            />
                          )}
                        </div>

                        <div className="sm:col-span-2">
                          {locationOptions && (
                            <SelectMenu
                              label="Select Location"
                              options={locationOptions}
                              onChange={(value) => {
                                setNewFlightPlan({
                                  ...newFlightPlan,
                                  destination: value,
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
                                !newFlightPlan?.shipId ||
                                !newFlightPlan.destination
                              ) {
                                return
                              }
                              handleCreateFlightPlan(
                                newFlightPlan.shipId,
                                newFlightPlan.destination
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
                  User {process.env.REACT_APP_USERNAME}
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
                              Ship
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
                                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 font-medium text-gray-900">
                                  {
                                    myShips?.ships.find(
                                      (s) => s.id === flightPlan.shipId
                                    )?.type
                                  }
                                </td>
                                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                  {flightPlan.departure}
                                </td>
                                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                  {flightPlan.destination}
                                </td>
                                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                  {moment(flightPlan.createdAt).format(
                                    'DD/MM/YYYY HH:mm:ss A'
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                  {moment(flightPlan.arrivesAt).format(
                                    'DD/MM/YYYY HH:mm:ss A'
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr className="bg-white text-center">
                              <td
                                className="px-6 py-4 text-gray-500"
                                colSpan={5}
                              >
                                You have no active flight plans
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
                  User {process.env.REACT_APP_USERNAME}
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
                              Ship
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
                                key={ship.shipId}
                                className={
                                  i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                }
                              >
                                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 font-medium text-gray-900">
                                  {ship.shipType}
                                </td>
                                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                  {
                                    myShips?.ships.find(
                                      (s) => s.id === ship.shipId
                                    )?.location
                                  }
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr className="bg-white text-center">
                              <td
                                className="px-6 py-4 text-gray-500"
                                colSpan={5}
                              >
                                You have no docked ships
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
    </>
  )
}

export default Systems
