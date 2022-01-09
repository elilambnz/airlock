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
import { ListShipsResponse } from '../../types/Ship'
import { formatThousands } from '../../utils/helpers'
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
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
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
                      {user?.credits ? formatThousands(user.credits) : 0}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            <div className="max-w-7xl mx-auto py-6">
              <h2 className="text-2xl font-bold text-gray-900">Ships</h2>
            </div>

            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {myShips?.ships
                .filter((s) => !!s.id)
                ?.map((ship) => (
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
                        <div className="flex items-center mt-1 text-gray-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <p className="ml-1 text-sm truncate">
                            {ship.manufacturer}
                          </p>
                        </div>
                        <div className="flex items-center mt-1 text-gray-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                          </svg>
                          <p className="ml-1 text-sm truncate">
                            {ship.maxCargo - ship.spaceAvailable} /{' '}
                            {ship.maxCargo}
                          </p>
                        </div>
                        <div className="flex items-center mt-1 text-gray-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <p className="ml-1 text-sm truncate">
                            {ship.location}
                          </p>
                        </div>
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
                            onClick={() => setShipToScrap(ship.id!)}
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
                            className={
                              'relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500' +
                              (ship.spaceAvailable === ship.maxCargo
                                ? ' text-gray-500'
                                : '')
                            }
                            onClick={() => setShipToManageCargo(ship.id!)}
                            disabled={ship.spaceAvailable === ship.maxCargo}
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
                .filter((s) => !!s.id && s.id !== shipToManageCargo)
                ?.map((s) => ({
                  value: s.id!,
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
