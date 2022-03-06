import { useState } from 'react'
import '../../App.css'
import AlertModal from '../../components/Modal/AlertModal'
import Modal from '../../components/Modal/index'
import useAutomation from '../../hooks/useAutomation'
import {
  RouteEventType,
  TradeRoute,
  TradeRouteStatus,
} from '../../types/Automation'
import { AutomationStatus } from '../../providers/AutomationProvider'
import RouteSteps from './components/RouteSteps'
import AssignedShips from './components/AssignedShips'
import Alert from '../../components/Alert'
import { ChipIcon, InformationCircleIcon } from '@heroicons/react/solid'
import moment from 'moment'
import 'moment-duration-format'
import RouteConfiguration from './components/RouteConfiguration'
import { getShipName } from '../../utils/helpers'
import { GoodType } from '../../types/Order'

export default function Automation() {
  const [showInfo, setShowInfo] = useState(false)
  const [routeToManage, setRouteToManage] = useState<TradeRoute>()
  const [routeToEdit, setRouteToEdit] = useState<TradeRoute>()

  const {
    status,
    runTime,
    tradeRoutes,
    tradeRouteLog,
    setStatus,
    removeTradeRoute,
    pauseTradeRoute,
    resumeTradeRoute,
  } = useAutomation()

  const handleRemoveTradeRoute = async (id: string, version: number) => {
    try {
      await removeTradeRoute(id, version)
    } catch (error) {
      console.error('Error removing trade route', error)
    }
  }

  return (
    <>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-gray-900">Automation</h1>
            <button
              className="text-gray-900 hover:text-gray-600 focus:outline-none focus:text-gray-600 ml-4"
              onClick={() => setShowInfo(true)}
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
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>
      <main>
        <div
          className="bg-gray-100"
          style={{
            minHeight: 'calc(100vh - 148px)',
          }}
        >
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div>
              <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Status
                    </dt>
                    <dd className="mt-1 flex justify-between items-baseline md:block lg:flex">
                      <div className="flex items-baseline">
                        <button
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          onClick={() => {
                            if (status === AutomationStatus.Stopped) {
                              setStatus(AutomationStatus.Running)
                            } else {
                              setStatus(AutomationStatus.Stopped)
                            }
                          }}
                        >
                          {status === AutomationStatus.Stopped
                            ? 'Start'
                            : 'Stop'}
                        </button>
                      </div>

                      <div
                        className={
                          'inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium md:mt-2 lg:mt-0' +
                          (status === AutomationStatus.Running
                            ? ' bg-green-100 text-green-800'
                            : status === AutomationStatus.Stopped
                            ? ' bg-red-100 text-red-800'
                            : '')
                        }
                      >
                        {status}
                      </div>
                    </dd>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Run Time
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {moment.duration(runTime, 'seconds').format('HH:mm:ss')}
                    </dd>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Routes
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {tradeRoutes.data?.length ?? 0}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            <div className="max-w-7xl mx-auto py-6">
              <h2 className="text-2xl font-bold text-gray-900">Trading</h2>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Create New Route
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Plan automated trade routes for your fleet.
                </p>
              </div>
              <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg"></div>
                    <RouteConfiguration />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Trading Routes
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Last updated:{' '}
                  {moment(tradeRoutes.dataUpdatedAt).format(
                    'DD/MM/YY hh:mm:ss a'
                  )}
                </p>
              </div>
              <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg"></div>
                    {tradeRoutes.data && tradeRoutes.data.length > 0 ? (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Locations
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Goods
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Assigned Ships
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Auto Refuel
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
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
                          {tradeRoutes.data.map((route, i) => (
                            <tr
                              key={i}
                              className={
                                i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                              }
                            >
                              <td className="px-6 py-4 text-sm leading-5 font-medium text-gray-900">
                                {route.events
                                  .filter(
                                    (e) => e.type === RouteEventType.TRAVEL
                                  )
                                  ?.reduce(
                                    (acc: string[], cur) => [
                                      ...acc,
                                      String(cur.location),
                                    ],
                                    []
                                  )
                                  .join(' → ')}
                              </td>
                              <td className="px-6 py-4 text-sm leading-5 text-gray-500">
                                {[
                                  ...new Set(
                                    route.events
                                      .filter(
                                        (e) =>
                                          e.type === RouteEventType.BUY ||
                                          e.type === RouteEventType.SELL
                                      )
                                      ?.reduce(
                                        (acc: string[], cur) => [
                                          ...acc,
                                          String(
                                            GoodType[
                                              cur.good
                                                ?.good as keyof typeof GoodType
                                            ]
                                          ),
                                        ],
                                        []
                                      )
                                  ),
                                ].join(', ')}
                              </td>
                              <td className="px-6 py-4 text-sm leading-5 text-gray-500">
                                {route.assignedShips
                                  .map((id) => getShipName(id))
                                  .join(', ')}
                              </td>
                              <td className="px-6 py-4 text-sm leading-5 text-gray-500">
                                {route.autoRefuel ? 'Yes' : 'No'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                <span
                                  className={
                                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full' +
                                    (route.status === TradeRouteStatus.ACTIVE
                                      ? ' bg-green-100 text-green-800'
                                      : route.status === TradeRouteStatus.PAUSED
                                      ? ' bg-yellow-100 text-yellow-800'
                                      : route.status === TradeRouteStatus.ERROR
                                      ? ' bg-red-100 text-red-800'
                                      : '')
                                  }
                                >
                                  {route.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                <button
                                  className="text-indigo-600 hover:text-indigo-900"
                                  onClick={() => {
                                    setRouteToManage(route)
                                  }}
                                >
                                  View
                                </button>
                                <button
                                  className="ml-4 text-indigo-600 hover:text-indigo-900"
                                  onClick={() => {
                                    setRouteToEdit(route)
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  className="ml-4 text-red-600 hover:text-red-900"
                                  onClick={() => {
                                    handleRemoveTradeRoute(
                                      route.id,
                                      route._version
                                    )
                                  }}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="flex justify-center">
                        <div className="w-full py-8 px-4">
                          <div className="flex flex-col items-center text-center mb-4">
                            <ChipIcon className="w-12 h-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                              No routes have been created yet.
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Increase efficiency by automating your trades.
                            </p>
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
      <AlertModal
        icon={
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
            <InformationCircleIcon
              className="h-6 w-6 text-indigo-600"
              aria-hidden="true"
            />
          </div>
        }
        open={showInfo}
        title="About automation"
        message={`Automation routes are saved to a secondary database. This means that you can leave the game and when you return, the routes you set will be saved. This browser tab must remain open to run automation routes, but does not have to be focused.\n\nThis feature is not part of, nor endorsed by the official SpaceTraders API. To opt out of this feature, you can simply choose to not create any automation routes.`}
        onClose={() => setShowInfo(false)}
        className="w-full md:max-w-xl"
      />
      <Modal
        open={!!routeToEdit}
        title="Edit Route"
        content={
          <>
            {routeToEdit && (
              <div className="mt-4">
                <RouteConfiguration routeToEdit={routeToEdit} />
              </div>
            )}
          </>
        }
        closeText="Close"
        onClose={() => setRouteToEdit(undefined)}
        className="w-full md:max-w-6xl"
      />
      <Modal
        open={!!routeToManage}
        title="Manage Route"
        content={
          <>
            {routeToManage && (
              <div>
                {tradeRoutes.data?.find((r) => r.id === routeToManage.id)
                  ?.status === TradeRouteStatus.ERROR && (
                  <div className="mt-2">
                    <Alert
                      title="Error"
                      message={routeToManage.errorMessage || ''}
                    />
                  </div>
                )}
                {tradeRoutes.data?.find((r) => r.id === routeToManage.id)
                  ?.status === TradeRouteStatus.ACTIVE && (
                  <button
                    className="mt-4 text-red-600 hover:text-red-900"
                    onClick={() => {
                      pauseTradeRoute(routeToManage.id)
                    }}
                  >
                    Pause
                  </button>
                )}
                {tradeRoutes.data?.find((r) => r.id === routeToManage.id)
                  ?.status !== TradeRouteStatus.ACTIVE && (
                  <button
                    className="mt-4 text-green-600 hover:text-green-900"
                    onClick={() => {
                      resumeTradeRoute(routeToManage.id)
                    }}
                  >
                    Resume from start
                  </button>
                )}
                <div className="mt-4">
                  <h4 className="text-md leading-6 font-medium text-gray-900">
                    Steps
                  </h4>
                </div>
                <RouteSteps
                  tradeRoute={routeToManage}
                  notActive={
                    tradeRoutes.data?.find((r) => r.id === routeToManage.id)
                      ?.status !== TradeRouteStatus.ACTIVE
                  }
                  handleResume={(step: number) => {
                    resumeTradeRoute(routeToManage.id, step)
                  }}
                />
                <div className="mt-4">
                  <h4 className="text-md leading-6 font-medium text-gray-900">
                    Assigned Ships
                  </h4>
                </div>
                <div className="mt-4">
                  Auto Refuel: {routeToManage.autoRefuel ? 'Yes' : 'No'}
                </div>
                <AssignedShips tradeRoute={routeToManage} />
                <details>
                  <summary className="text-md leading-6 font-medium text-gray-900 hover:cursor-pointer">
                    Show log
                  </summary>
                  <div
                    className="bg-gray-900 p-4 rounded-md text-white overflow-auto"
                    style={{ height: '200px' }}
                  >
                    <pre className="text-xs">
                      {tradeRouteLog[routeToManage.id]?.map(
                        (l: string, i: number) => (
                          <p key={i}>{l}</p>
                        )
                      )}
                    </pre>
                  </div>
                </details>
              </div>
            )}
          </>
        }
        closeText="Close"
        onClose={() => setRouteToManage(undefined)}
      />
    </>
  )
}
