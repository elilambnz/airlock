import {
  CubeIcon,
  LightningBoltIcon,
  OfficeBuildingIcon,
  TruckIcon,
} from '@heroicons/react/solid'
import { useContext, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import {
  jettisonShipCargo,
  listMyShips,
  transferShipCargo,
} from '../../../../api/routes/my'
import Select from '../../../../components/Select'
import {
  NotificationContext,
  NotificationType,
} from '../../../../providers/NotificationProvider'
import { GoodType } from '../../../../types/Order'
import { Ship, ShipCargo } from '../../../../types/Ship'
import {
  formatNumberCommas,
  getErrorMessage,
  getShipName,
} from '../../../../utils/helpers'

interface ManageShipProps {
  ship?: Ship
}

export default function ManageShip(props: ManageShipProps) {
  const { ship } = props

  const [cargoToTransfer, setCargoToTransfer] = useState<
    ShipCargo & {
      shipId?: string
      toShipId?: string
      maxQuantity: number
    }
  >()
  const [cargoToJettison, setCargoToJettison] = useState<
    ShipCargo & { shipId?: string; maxQuantity: number }
  >()

  const { push } = useContext(NotificationContext)

  const queryClient = useQueryClient()
  const myShips = useQuery('myShips', listMyShips)

  const handleTransferCargo = useMutation(
    ({
      id,
      toShipId,
      good,
      quantity,
    }: {
      id: string
      toShipId: string
      good: string
      quantity: number
    }) => transferShipCargo(id, toShipId, good, quantity),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('myShips')
        push({
          title: 'Successfully transferred cargo',
          message: `Ship ${getShipName(data.toShip.id)} now has ${
            data.toShip.maxCargo - data.toShip.spaceAvailable
          }/${data.toShip.maxCargo} cargo items`,
          type: NotificationType.SUCCESS,
        })
      },
      onError: (error: any) => {
        push({
          title: 'Error transferring cargo',
          message: getErrorMessage(error),
          type: NotificationType.ERROR,
        })
      },
    }
  )

  const handleJettisonCargo = useMutation(
    ({ shipId, good, quantity }: ShipCargo & { shipId: string }) =>
      jettisonShipCargo(shipId, good, quantity),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('myShips')
        push({
          title: 'Successfully jettisoned cargo',
          message: `Ship ${getShipName(data.shipId)} now has ${
            data.quantityRemaining
          } ${
            GoodType[data.good as unknown as keyof typeof GoodType]
          } remaining`,
          type: NotificationType.SUCCESS,
        })
      },
      onError: (error: any) => {
        push({
          title: 'Error jettisoning cargo',
          message: getErrorMessage(error),
          type: NotificationType.ERROR,
        })
      },
    }
  )

  const shipOptions =
    myShips.data?.ships
      .filter(
        (s) => !!s.id && s.id !== ship?.id && s.location === ship?.location
      )
      .map((ship) => ({
        value: ship.id,
        label: `${getShipName(ship.id)}
            `,
        tags: [
          ship.type,
          ship.location,
          `⛽ ${
            ship.cargo.find(
              (c) =>
                GoodType[c.good as unknown as keyof typeof GoodType] ===
                GoodType.FUEL
            )?.quantity ?? 0
          }`,
          `📦 ${ship.maxCargo - ship.spaceAvailable}/${ship.maxCargo}`,
        ],
        icon: (
          <div className="flex h-5 w-5 items-center justify-center">
            <span className="text-xs">🚀</span>
          </div>
        ),
      })) ?? []

  const maxCargoToTransfer =
    (cargoToTransfer?.toShipId &&
      Math.min(
        cargoToTransfer.maxQuantity,
        myShips.data?.ships.find((s) => s.id === cargoToTransfer.toShipId)
          ?.spaceAvailable ??
          0 / (cargoToTransfer.totalVolume / cargoToTransfer.quantity)
      )) ??
    0

  if (!ship || !ship.id) {
    return <div>No ship selected</div>
  }

  return (
    <div className="mt-4 px-4 py-2">
      <div className="overflow-x-auto">
        <div className="mb-4 flex items-center py-1 text-sm leading-5 text-gray-500">
          <span className="inline-flex items-center">
            <span className="sr-only">Manufacturer</span>
            <OfficeBuildingIcon className="mr-1 h-4 w-4 text-gray-900" />{' '}
            {ship.manufacturer}
          </span>
          <span className="ml-4 inline-flex items-center">
            <span className="sr-only">Loading speed</span>
            <TruckIcon className="mr-1 h-4 w-4 text-gray-900" />{' '}
            {formatNumberCommas(ship.loadingSpeed)}
          </span>
          <span className="ml-4 inline-flex items-center">
            <span className="sr-only">Max cargo</span>
            <CubeIcon className="mr-1 h-4 w-4 text-gray-900" />{' '}
            {formatNumberCommas(ship.maxCargo)}
          </span>
          <span className="ml-4 inline-flex items-center">
            <span className="sr-only">Speed</span>
            <LightningBoltIcon className="mr-1 h-4 w-4 text-gray-900" />{' '}
            {ship.speed}
          </span>
        </div>

        <h2 className="text-md mb-2 font-medium text-gray-900">Cargo hold</h2>

        <div className="mb-4 inline-block min-w-full py-2 px-1 align-middle">
          <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Good
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Quantity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {ship.cargo.map((cargo, i) => (
                  <tr
                    key={cargo.good}
                    className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {GoodType[cargo.good as unknown as keyof typeof GoodType]}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatNumberCommas(cargo.quantity)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <button
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => {
                          setCargoToJettison(undefined)
                          setCargoToTransfer({
                            ...cargo,
                            shipId: ship.id,
                            maxQuantity: cargo.quantity,
                          })
                        }}
                      >
                        Transfer
                      </button>
                      <button
                        className="ml-4 text-red-600 hover:text-red-900"
                        onClick={() => {
                          setCargoToTransfer(undefined)
                          setCargoToJettison({
                            ...cargo,
                            shipId: ship.id,
                            maxQuantity: cargo.quantity,
                          })
                        }}
                      >
                        Jettison
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {cargoToTransfer && (
          <div className="py-2 px-1">
            <form>
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  Transfer{' '}
                  {
                    GoodType[
                      cargoToTransfer.good as unknown as keyof typeof GoodType
                    ]
                  }
                </h3>
              </div>
              {shipOptions.length > 0 ? (
                <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-5">
                  <div className="sm:col-span-3">
                    <Select
                      label="Select Ship"
                      options={shipOptions}
                      value={cargoToTransfer.toShipId}
                      onChange={(value) => {
                        setCargoToTransfer(
                          (prev) =>
                            prev && {
                              ...prev,
                              toShipId: value,
                            }
                        )
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
                        max={maxCargoToTransfer}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        onChange={(e) => {
                          const quantity = !isNaN(parseInt(e.target.value))
                            ? parseInt(e.target.value)
                            : 0
                          setCargoToTransfer(
                            (prev) =>
                              prev && {
                                ...prev,
                                quantity,
                              }
                          )
                        }}
                      />
                    </div>
                  </div>
                  <div className="pt-6 sm:col-span-1">
                    <button
                      type="submit"
                      className={
                        'inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2' +
                        (cargoToTransfer.quantity === 0 ||
                        cargoToTransfer.quantity > maxCargoToTransfer ||
                        !cargoToTransfer.toShipId
                          ? ' cursor-not-allowed opacity-50'
                          : '')
                      }
                      disabled={
                        cargoToTransfer.quantity === 0 ||
                        cargoToTransfer.quantity > maxCargoToTransfer ||
                        !cargoToTransfer.toShipId
                      }
                      onClick={(e) => {
                        e.preventDefault()
                        const { shipId, toShipId, good, quantity } =
                          cargoToTransfer
                        if (!shipId || !toShipId) {
                          return
                        }
                        handleTransferCargo.mutate({
                          id: shipId,
                          toShipId,
                          good,
                          quantity,
                        })
                      }}
                    >
                      Transfer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <div className="w-full py-4">
                    <div className="mb-4 flex flex-col items-center text-center">
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No ships available to transfer cargo to.
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Ships must be docked in the same location to be able to
                        transfer cargo.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
        {cargoToJettison && (
          <div className="py-2 px-1">
            <form>
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  Jettison{' '}
                  {
                    GoodType[
                      cargoToJettison.good as unknown as keyof typeof GoodType
                    ]
                  }
                </h3>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-5">
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
                      max={cargoToJettison.maxQuantity}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      onChange={(e) => {
                        const quantity = !isNaN(parseInt(e.target.value))
                          ? parseInt(e.target.value)
                          : 0
                        setCargoToJettison(
                          (prev) =>
                            prev && {
                              ...prev,
                              quantity,
                            }
                        )
                      }}
                    />
                  </div>
                </div>
                <div className="pt-6 sm:col-span-1">
                  <button
                    type="submit"
                    className={
                      'inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2' +
                      (cargoToJettison.quantity === 0
                        ? ' cursor-not-allowed opacity-50'
                        : '')
                    }
                    disabled={cargoToJettison.quantity === 0}
                    onClick={(e) => {
                      e.preventDefault()
                      const { shipId } = cargoToJettison
                      if (!shipId) {
                        return
                      }
                      handleJettisonCargo.mutate({ ...cargoToJettison, shipId })
                    }}
                  >
                    Jettison
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
