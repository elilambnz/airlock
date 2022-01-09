import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  getMyAccount,
  listMyShips,
  jettisonShipCargo,
  scrapShip,
  transferShipCargo,
} from '../../api/routes/my'
import '../../App.css'
import SimpleModal from '../../components/Modal/SimpleModal'
import DangerModal from '../../components/Modal/DangerModal'

import { User } from '../../types/Account'
import {
  ListShipsResponse,
  ScrapShipResponse,
  ShipJettisonCargoResponse,
  ShipResponse,
  TransferShipCargoResponse,
} from '../../types/Ship'
import { formatCredits } from '../../utils/helpers'
import ManageCargo from './components/ManageCargo'

function Account() {
  const [user, setUser] = useState<User>()
  const [myShips, setMyShips] = useState<ListShipsResponse>()

  const [shipToManageCargo, setShipToManageCargo] = useState<string | null>(
    null
  )
  const [shipToScrap, setShipToScrap] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const account = await getMyAccount()
      setUser(account?.user)
      setMyShips(await listMyShips())
    }
    init()
  }, [])

  const handleTransferCargo = async (
    shipId: string,
    toShipId: string,
    good: string,
    quantity: number
  ) => {
    try {
      const response = await transferShipCargo(shipId, toShipId, good, quantity)
      console.log(response)
      if (!response) {
        return
      }
      const { fromShip, toShip } = response
      setMyShips({
        ships: [
          ...(myShips?.ships.filter((ship) => ship.id !== fromShip.id) ?? []),
          toShip,
        ],
      })
    } catch (error) {
      console.error(error)
    }
  }

  const handleJettisonCargo = async (
    shipId: string,
    good: string,
    quantity: number
  ) => {
    try {
      const result = await jettisonShipCargo(shipId, good, quantity)
      console.log(result)
    } catch (error) {
      console.error('Error jettisoning cargo', error)
    }
  }

  const handleScrapShip = async (shipId: string) => {
    try {
      const result = await scrapShip(shipId)
      console.log(result)
    } catch (error) {
      console.error('Error scrapping ship', error)
    } finally {
      setShipToScrap(null)
    }
  }

  return (
    <>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Account</h1>
        </div>
      </header>
      <main>
        <div className="bg-gray-100 min-h-screen">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div>
              <h3 className="text-lg leading-6 font-bold text-gray-900">
                {user?.username}
              </h3>
              <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Ships
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {user?.shipCount}
                    </dd>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Structures
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {user?.structureCount}
                    </dd>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Credits
                    </dt>
                    <dd className="flex items-baseline mt-1 text-3xl font-semibold text-gray-900">
                      {user?.credits ? formatCredits(user.credits) : 0}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            <div className="max-w-7xl mx-auto py-6">
              <h2 className="text-2xl font-bold text-gray-900">Ships</h2>
            </div>

            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {myShips?.ships.map((ship) => (
                <li
                  key={ship.id}
                  className="col-span-1 bg-white rounded-lg shadow divide-y divide-gray-200"
                >
                  <div className="w-full flex items-center justify-between p-6 space-x-6">
                    <div className="flex-1 truncate">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-gray-900 text-sm font-medium truncate">
                          {ship.type}
                        </h3>
                        <span className="flex-shrink-0 inline-block px-2 py-0.5 text-blue-800 text-xs font-medium bg-blue-100 rounded-full">
                          {ship.class}
                        </span>
                      </div>
                      <p className="mt-1 text-gray-500 text-sm truncate">
                        {ship.manufacturer}
                      </p>
                      <p className="mt-2 text-gray-500 text-sm truncate">
                        Cargo loaded: {ship.maxCargo - ship.spaceAvailable} /{' '}
                        {ship.maxCargo}
                      </p>
                      <p className="mt-2 text-gray-500 text-sm truncate">
                        Location: {ship.location}
                      </p>
                    </div>
                    <div className="self-start flex-shrink-0">
                      <button className="w-8 h-8 bg-white inline-flex items-center justify-center text-red-400 rounded-full bg-transparent hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        <span className="sr-only">Scrap ship</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          onClick={() => setShipToScrap(ship.id)}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="-mt-px flex divide-x divide-gray-200">
                      <div className="w-0 flex-1 flex">
                        <button
                          className="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500"
                          onClick={() => setShipToManageCargo(ship.id)}
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
                              strokeWidth="2"
                              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                          </svg>
                          <span className="ml-3">Manage cargo</span>
                        </button>
                      </div>
                      <div className="-ml-px w-0 flex-1 flex">
                        <Link
                          to="/systems"
                          className="relative w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-br-lg hover:text-gray-500"
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
                              strokeWidth="2"
                              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="ml-3">Travel</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      {shipToManageCargo && (
        <SimpleModal
          title="Manage cargo"
          content={
            <ManageCargo
              ship={myShips?.ships.find(
                (ship) => ship.id === shipToManageCargo
              )}
              shipOptions={myShips?.ships
                .filter((s) => s.id !== shipToManageCargo)
                ?.map((s) => ({
                  value: s.id,
                  label: `${s.type} ${s.maxCargo - s.spaceAvailable} / ${
                    s.maxCargo
                  }`,
                }))}
              handleJettisonCargo={handleJettisonCargo}
              handleTransferCargo={handleTransferCargo}
            />
          }
          handleClose={() => setShipToManageCargo(null)}
        />
      )}
      {shipToScrap && (
        <DangerModal
          title="Scrap Ship"
          content="Are you sure you want to scrap this ship for credits?"
          actionText="Scrap"
          handleClose={() => setShipToScrap(null)}
          handleConfirm={() => handleScrapShip(shipToScrap)}
        />
      )}
    </>
  )
}

export default Account
