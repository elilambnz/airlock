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
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {user.data.user.username}
          </h3>
          <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="px-4 py-5 sm:p-6">
                <dt className="truncate text-sm font-medium text-gray-500">
                  Credits
                </dt>
                <dd className="mt-1 flex items-baseline text-3xl font-semibold text-gray-900">
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
                    <ArrowSmRightIcon className="ml-1 h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="px-4 py-5 sm:p-6">
                <dt className="truncate text-sm font-medium text-gray-500">
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
                    <ArrowSmRightIcon className="ml-1 h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="px-4 py-5 sm:p-6">
                <dt className="truncate text-sm font-medium text-gray-500">
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
                    <ArrowSmRightIcon className="ml-1 h-5 w-5" />
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
                    className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow"
                  >
                    <div className="flex w-full items-center justify-between space-x-6 p-6">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center space-x-3">
                          <h3 className="truncate text-sm font-medium text-gray-900">
                            {ship.type}
                          </h3>
                          <span className="inline-block flex-shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                            {getShipName(ship.id)}
                          </span>
                        </div>

                        <div className="flex flex-col justify-start text-sm">
                          <span className="mt-1 mb-2 inline-flex items-center">
                            <span className="sr-only">Location</span>
                            <GlobeIconSolid className="mr-1 h-4 w-4 text-gray-500" />{' '}
                            {ship.flightPlanId
                              ? 'In transit'
                              : `Docked at ${ship.location}`}
                          </span>
                          <span className="inline-flex items-center">
                            <span className="sr-only">Manufacturer</span>
                            <OfficeBuildingIcon className="mr-1 h-4 w-4 text-gray-500" />{' '}
                            {ship.manufacturer}
                          </span>
                          <span className="mt-1 inline-flex items-center">
                            <span className="sr-only">Loading speed</span>
                            <TruckIcon className="mr-1 h-4 w-4 text-gray-500" />{' '}
                            {formatNumberCommas(ship.loadingSpeed)}
                          </span>
                          <span className="mt-1 inline-flex items-center">
                            <span className="sr-only">Max cargo</span>
                            <CubeIconSolid className="mr-1 h-4 w-4 text-gray-500" />{' '}
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
                                  'truncate text-sm text-gray-900' +
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
                            <LightningBoltIcon className="mr-1 h-4 w-4 text-gray-500" />{' '}
                            {ship.speed}
                          </span>
                        </div>
                      </div>

                      <div className="flex-shrink-0 self-start">
                        <button
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white bg-transparent text-red-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          onClick={() => setShipToScrap(ship.id)}
                        >
                          <span className="sr-only">Scrap ship</span>
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="-mt-px flex divide-x divide-gray-200">
                        <div className="flex w-0 flex-1">
                          <button
                            className={
                              'relative -mr-px inline-flex w-0 flex-1 items-center justify-center rounded-bl-lg border border-transparent py-4 text-sm font-medium text-gray-700 hover:text-gray-500' +
                              (ship.spaceAvailable === ship.maxCargo
                                ? ' text-gray-500'
                                : '')
                            }
                            onClick={() => navigate(`/account/${ship.id}`)}
                            disabled={ship.spaceAvailable === ship.maxCargo}
                          >
                            <CubeIcon className="h-6 w-6" />
                            <span className="ml-3">Manage</span>
                          </button>
                        </div>
                        <div className="-ml-px flex w-0 flex-1">
                          <Link
                            to={`/systems/${
                              ship.location?.split('-')[0] ?? ''
                            }?ship=${ship.id}`}
                            className="relative inline-flex w-0 flex-1 items-center justify-center rounded-br-lg border border-transparent py-4 text-sm font-medium text-gray-700 hover:text-gray-500"
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
                      className="col-span-1 animate-pulse divide-y divide-gray-200 rounded-lg bg-white shadow"
                    >
                      <div className="flex w-full items-center justify-between space-x-6 p-6">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="h-5 w-48 rounded-md bg-gray-300"></div>
                          </div>

                          <div className="mt-2 flex items-center text-gray-500">
                            <div className="h-5 w-24 rounded-md bg-gray-300"></div>
                          </div>
                          <div className="mt-1 flex">
                            <div className="flex items-center text-gray-500">
                              <div className="h-5 w-9 rounded-md bg-gray-300"></div>
                            </div>
                            <div className="ml-1 flex items-center text-gray-500">
                              <div className="h-5 w-9 rounded-md bg-gray-300"></div>
                            </div>
                            <div className="ml-1 flex items-center text-gray-500">
                              <div className="h-5 w-9 rounded-md bg-gray-300"></div>
                            </div>
                          </div>

                          <div className="mt-2 flex items-center text-gray-500">
                            <div className="h-5 w-9 rounded-md bg-gray-300"></div>
                          </div>
                          <div className="mt-1 flex items-center text-gray-500">
                            <div className="h-5 w-9 rounded-md bg-gray-300"></div>
                          </div>
                          <div className="mt-1 flex items-center text-gray-500">
                            <div className="h-5 w-9 rounded-md bg-gray-300"></div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 self-start">
                          <div className="h-5 w-6 rounded-md bg-gray-300"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex divide-x divide-gray-200">
                          <div className="flex w-0 flex-1 justify-center p-3.5">
                            <div className="h-7 w-24 rounded-md bg-gray-300"></div>
                          </div>
                          <div className="flex w-0 flex-1 justify-center p-3.5">
                            <div className="h-7 w-24 rounded-md bg-gray-300"></div>
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
              <div className="rounded-lg bg-white py-8 px-4 shadow">
                <div className="mb-4 text-center">
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
                    className="focus:shadow-outline inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium leading-5 text-white transition duration-150 ease-in-out hover:bg-indigo-500 focus:outline-none"
                  >
                    Marketplace
                    <ArrowSmRightIcon className="ml-1 h-5 w-5" />
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
