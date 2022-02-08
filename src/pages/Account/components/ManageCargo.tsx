import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import {
  jettisonShipCargo,
  listMyShips,
  transferShipCargo,
} from '../../../api/routes/my'
import Select from '../../../components/Select'
import { GoodType } from '../../../types/Order'
import { Ship, ShipCargo } from '../../../types/Ship'
import { getShipName } from '../../../utils/helpers'

interface ManageCargoProps {
  ship?: Ship
}

const ManageCargo = (props: ManageCargoProps) => {
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

  const queryClient = useQueryClient()
  const myShips = useQuery('myShips', listMyShips)

  const transferShipCargoMutation = useMutation(
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
      onSuccess: () => {
        queryClient.invalidateQueries('myShips')
      },
    }
  )

  const handleTransferCargo = async (
    cargoToTransfer: ShipCargo & { shipId?: string; toShipId?: string }
  ) => {
    const { shipId, toShipId, good, quantity } = cargoToTransfer
    if (!shipId || !toShipId) {
      return
    }
    try {
      await transferShipCargoMutation.mutateAsync({
        id: shipId,
        toShipId,
        good,
        quantity,
      })
    } catch (error) {
      console.error(error)
    }
  }

  const handleJettisonCargo = async (
    cargoToJettison: ShipCargo & { shipId?: string }
  ) => {
    const { shipId, good, quantity } = cargoToJettison
    if (!shipId) {
      return
    }
    try {
      const result = await jettisonShipCargo(shipId, good, quantity)
      console.log(result)
    } catch (error) {
      console.error('Error jettisoning cargo', error)
    }
  }

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
              // @ts-expect-error
              (c) => GoodType[c.good] === GoodType.FUEL
            )?.quantity ?? 0
          }`,
          `📦 ${ship.maxCargo - ship.spaceAvailable}/${ship.maxCargo}`,
        ],
        icon: (
          <div className="flex items-center justify-center w-5 h-5">
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
        <div className="py-2 px-1 align-middle inline-block min-w-full">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Good
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Quantity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody x-max="2">
                {ship.cargo.map((cargo, i) => (
                  <tr
                    key={cargo.good}
                    className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {/* @ts-expect-error */}
                      {GoodType[cargo.good]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cargo.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
            <form className="mt-4">
              <div>
                <h3 className="text-md font-medium text-gray-900">
                  {/* @ts-expect-error */}
                  Transfer {GoodType[cargoToTransfer.good]}
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
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                        'inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' +
                        (cargoToTransfer.quantity === 0 ||
                        cargoToTransfer.quantity > maxCargoToTransfer ||
                        !cargoToTransfer.toShipId
                          ? ' opacity-50 cursor-not-allowed'
                          : '')
                      }
                      disabled={
                        cargoToTransfer.quantity === 0 ||
                        cargoToTransfer.quantity > maxCargoToTransfer ||
                        !cargoToTransfer.toShipId
                      }
                      onClick={(e) => {
                        e.preventDefault()
                        handleTransferCargo(cargoToTransfer)
                      }}
                    >
                      Transfer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <div className="w-full py-4">
                    <div className="flex flex-col items-center text-center mb-4">
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
            <form className="mt-4">
              <div>
                <h3 className="text-md font-medium text-gray-900">
                  {/* @ts-expect-error */}
                  Jettison {GoodType[cargoToJettison.good]}
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
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                      'inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' +
                      (cargoToJettison.quantity === 0
                        ? ' opacity-50 cursor-not-allowed'
                        : '')
                    }
                    disabled={cargoToJettison.quantity === 0}
                    onClick={(e) => {
                      e.preventDefault()
                      handleJettisonCargo(cargoToJettison)
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

export default ManageCargo
