import { useContext, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { listMyShips, scrapShip, getMyAccount } from '../../../api/routes/my'
import '../../App.css'
import AlertModal from '../../../components/Modal/AlertModal'
import {
  abbreviateNumber,
  formatNumberCommas,
  getErrorMessage,
  getShipName,
} from '../../../utils/helpers'
import ManageShip from './components/ManageShip'
import Modal from '../../../components/Modal'
import Tooltip from '../../../components/Tooltip'
import { GoodType } from '../../../types/Order'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import {
  ArrowSmRightIcon,
  GlobeIcon,
  CubeIcon,
  TrashIcon,
} from '@heroicons/react/outline'
import {
  NotificationContext,
  NotificationType,
} from '../../../providers/NotificationProvider'
import Header from '../../../components/Header'
import Main from '../../../components/Main'
import Title from '../../../components/Title'
import {
  LightningBoltIcon,
  OfficeBuildingIcon,
  TruckIcon,
  CubeIcon as CubeIconSolid,
  GlobeIcon as GlobeIconSolid,
} from '@heroicons/react/solid'

export default function Account() {
  const [shipToScrap, setShipToScrap] = useState<string>()
  const [showFullCredits, setShowFullCredits] = useState(false)

  const navigate = useNavigate()
  const params = useParams()

  const { push } = useContext(NotificationContext)

  const queryClient = useQueryClient()
  const user = useQuery('user', getMyAccount)
  const myShips = useQuery('myShips', listMyShips)

  const handleScrapShip = useMutation((shipId: string) => scrapShip(shipId), {
    onSuccess: (data) => {
      queryClient.invalidateQueries('user')
      queryClient.invalidateQueries('myShips')
      push({
        title: 'Ship scrapped successfully',
        message: data.success,
        type: NotificationType.SUCCESS,
      })
    },
    onError: (error: any) => {
      push({
        title: 'Error scrapping ship',
        message: getErrorMessage(error),
        type: NotificationType.ERROR,
      })
    },
    onSettled: () => {
      setShipToScrap(undefined)
    },
  })

  if (!user.data) {
    return null
  }

  return (
    <>
      <Header>Account</Header>
      <Main>
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {user.data.user.username}
          </h3>
          <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Credits
                </dt>
                <dd className="flex items-baseline mt-1 text-3xl font-semibold text-gray-900">
                  <span
                    className="hover:cursor-pointer"
                    onClick={() => setShowFullCredits((prev) => !prev)}
                  >
                    {!showFullCredits
                      ? abbreviateNumber(user.data.user.credits ?? 0)
                      : formatNumberCommas(user.data.user.credits ?? 0)}
                  </span>
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link
                    to="/loans"
                    className="flex items-center font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    View loans
                    <ArrowSmRightIcon className="ml-1 w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Ships
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {user.data.user.shipCount}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link
                    to="/marketplace"
                    className="flex items-center font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Buy more ships
                    <ArrowSmRightIcon className="ml-1 w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Structures
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {user.data.user.structureCount}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link
                    to="/structures"
                    className="flex items-center font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    View structures
                    <ArrowSmRightIcon className="ml-1 w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </dl>
        </div>

        <Title>Ships</Title>

        {user.data.user.shipCount > 0 ? (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {!myShips.isLoading ? (
              myShips.data?.ships
                .sort(
                  (a, b) =>
                    a.type.localeCompare(b.type) ||
                    getShipName(a.id).localeCompare(getShipName(b.id))
                )
                .map((ship) => (
                  <li
                    key={ship.id}
                    className="col-span-1 bg-white rounded-lg shadow divide-y divide-gray-200"
                  >
                    <div className="w-full flex items-center justify-between p-6 space-x-6">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center space-x-3">
                          <h3 className="text-gray-900 text-sm font-medium truncate">
                            {ship.type}
                          </h3>
                          <span className="flex-shrink-0 inline-block px-2 py-0.5 text-blue-800 text-xs font-medium bg-blue-100 rounded-full">
                            {getShipName(ship.id)}
                          </span>
                        </div>

                        <div className="flex flex-col justify-start text-sm">
                          <span className="mt-1 mb-2 inline-flex items-center">
                            <span className="sr-only">Location</span>
                            <GlobeIconSolid className="mr-1 w-4 h-4 text-gray-500" />{' '}
                            {ship.flightPlanId
                              ? 'In transit'
                              : `Docked at ${ship.location}`}
                          </span>
                          <span className="inline-flex items-center">
                            <span className="sr-only">Manufacturer</span>
                            <OfficeBuildingIcon className="mr-1 w-4 h-4 text-gray-500" />{' '}
                            {ship.manufacturer}
                          </span>
                          <span className="mt-1 inline-flex items-center">
                            <span className="sr-only">Loading speed</span>
                            <TruckIcon className="mr-1 w-4 h-4 text-gray-500" />{' '}
                            {formatNumberCommas(ship.loadingSpeed)}
                          </span>
                          <span className="mt-1 inline-flex items-center">
                            <span className="sr-only">Max cargo</span>
                            <CubeIconSolid className="mr-1 w-4 h-4 text-gray-500" />{' '}
                            <Tooltip
                              title={ship.cargo
                                .map(
                                  (c) =>
                                    `${
                                      GoodType[
                                        c.good as unknown as keyof typeof GoodType
                                      ]
                                    }: ${c.quantity}` +
                                    (c.quantity !== c.totalVolume
                                      ? ` (${c.totalVolume})`
                                      : '')
                                )
                                .join(', ')}
                              className={
                                ship.spaceAvailable === ship.maxCargo
                                  ? 'display-none'
                                  : ''
                              }
                            >
                              <p
                                className={
                                  'text-sm truncate text-gray-900' +
                                  (ship.spaceAvailable < ship.maxCargo
                                    ? ' cursor-help'
                                    : '')
                                }
                              >
                                {formatNumberCommas(
                                  ship.maxCargo - ship.spaceAvailable
                                )}{' '}
                                / {formatNumberCommas(ship.maxCargo)}
                              </p>
                            </Tooltip>
                          </span>
                          <span className="mt-1 inline-flex items-center">
                            <span className="sr-only">Speed</span>
                            <LightningBoltIcon className="mr-1 w-4 h-4 text-gray-500" />{' '}
                            {ship.speed}
                          </span>
                        </div>
                      </div>

                      <div className="self-start flex-shrink-0">
                        <button
                          className="w-8 h-8 bg-white inline-flex items-center justify-center text-red-400 rounded-full bg-transparent hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          onClick={() => setShipToScrap(ship.id)}
                        >
                          <span className="sr-only">Scrap ship</span>
                          <TrashIcon className="w-5 h-5" />
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
                            onClick={() => navigate(`/account/${ship.id}`)}
                            disabled={ship.spaceAvailable === ship.maxCargo}
                          >
                            <CubeIcon className="w-6 h-6" />
                            <span className="ml-3">Manage</span>
                          </button>
                        </div>
                        <div className="-ml-px w-0 flex-1 flex">
                          <Link
                            to={`/systems/${
                              ship.location?.split('-')[0] ?? ''
                            }?ship=${ship.id}`}
                            className="relative w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-br-lg hover:text-gray-500"
                          >
                            <GlobeIcon className="h-6 w-6" />
                            <span className="ml-3">Plan flight</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
            ) : (
              <>
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <li
                      key={i}
                      className="col-span-1 bg-white rounded-lg shadow divide-y divide-gray-200 animate-pulse"
                    >
                      <div className="w-full flex items-center justify-between p-6 space-x-6">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="w-48 bg-gray-300 h-5 rounded-md"></div>
                          </div>

                          <div className="flex items-center mt-2 text-gray-500">
                            <div className="w-24 bg-gray-300 h-5 rounded-md"></div>
                          </div>
                          <div className="mt-1 flex">
                            <div className="flex items-center text-gray-500">
                              <div className="w-9 bg-gray-300 h-5 rounded-md"></div>
                            </div>
                            <div className="ml-1 flex items-center text-gray-500">
                              <div className="w-9 bg-gray-300 h-5 rounded-md"></div>
                            </div>
                            <div className="ml-1 flex items-center text-gray-500">
                              <div className="w-9 bg-gray-300 h-5 rounded-md"></div>
                            </div>
                          </div>

                          <div className="flex items-center mt-2 text-gray-500">
                            <div className="w-9 bg-gray-300 h-5 rounded-md"></div>
                          </div>
                          <div className="flex items-center mt-1 text-gray-500">
                            <div className="w-9 bg-gray-300 h-5 rounded-md"></div>
                          </div>
                          <div className="flex items-center mt-1 text-gray-500">
                            <div className="w-9 bg-gray-300 h-5 rounded-md"></div>
                          </div>
                        </div>
                        <div className="self-start flex-shrink-0">
                          <div className="w-6 bg-gray-300 h-5 rounded-md"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex divide-x divide-gray-200">
                          <div className="w-0 flex-1 flex p-3.5 justify-center">
                            <div className="w-24 bg-gray-300 h-7 rounded-md"></div>
                          </div>
                          <div className="w-0 flex-1 flex p-3.5 justify-center">
                            <div className="w-24 bg-gray-300 h-7 rounded-md"></div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
              </>
            )}
          </ul>
        ) : (
          <div className="flex justify-center">
            <div className="w-full">
              <div className="bg-white py-8 px-4 shadow rounded-lg">
                <div className="text-center mb-4">
                  <h1 className="text-2xl font-bold">
                    You don't have any ships!
                  </h1>
                  <p className="text-gray-600">
                    You can buy a ship by visiting the marketplace.
                  </p>
                </div>
                <div className="text-center">
                  <Link
                    to="/marketplace"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
                  >
                    Marketplace
                    <ArrowSmRightIcon className="ml-1 w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </Main>
      <Modal
        open={!!params.shipId}
        title={`Manage ship ${getShipName(params.shipId || '')}`}
        content={
          <ManageShip
            ship={myShips.data?.ships.find((ship) => ship.id === params.shipId)}
          />
        }
        className="w-full md:max-w-xl"
        onClose={() => {
          navigate(`/account`)
        }}
      />
      <AlertModal
        open={!!shipToScrap}
        title="Scrap Ship"
        message="Are you sure you want to scrap this ship for credits?"
        actionText="Scrap"
        closeText="Cancel"
        onClose={() => setShipToScrap(undefined)}
        onAction={() => shipToScrap && handleScrapShip.mutate(shipToScrap)}
      />
    </>
  )
}
