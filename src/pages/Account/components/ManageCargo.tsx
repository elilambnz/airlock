import React, { useEffect } from 'react'
import { CargoManageMode } from '..'
import SelectMenu from '../../../components/SelectMenu'
import { Ship, ShipCargo } from '../../../types/Ship'
import { capitaliseFirstLetter } from '../../../utils/helpers'

interface ManageCargoProps {
  ship?: Ship
  shipOptions?: { value: string; label: string }[]
  cargoToTransfer?: ShipCargo & { toShipId?: string }
  setCargoToTransfer: (value?: ShipCargo & { toShipId?: string }) => void
  cargoToJettison?: ShipCargo
  setCargoToJettison: (value?: ShipCargo) => void
  setCargoManageMode: (mode: CargoManageMode) => void
}

const ManageCargo = (props: ManageCargoProps) => {
  const {
    ship,
    shipOptions,
    cargoToTransfer,
    setCargoToTransfer,
    cargoToJettison,
    setCargoToJettison,
    setCargoManageMode,
  } = props

  if (!ship || !ship.id) {
    return <div>No ship selected</div>
  }

  return (
    <div className="flex flex-col">
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
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Transfer</span>
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Jettison</span>
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
                      {capitaliseFirstLetter(cargo.good.toLocaleLowerCase())}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cargo.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => {
                          setCargoManageMode(CargoManageMode.TRANSFER)
                          setCargoToJettison(undefined)
                          setCargoToTransfer(cargo)
                        }}
                      >
                        Transfer
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => {
                          setCargoManageMode(CargoManageMode.JETTISON)
                          setCargoToTransfer(undefined)
                          setCargoToJettison(cargo)
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
          <form>
            <div className="pt-8">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Transfer{' '}
                  {capitaliseFirstLetter(
                    cargoToTransfer.good.toLocaleLowerCase()
                  )}
                </h3>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
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
                      max={cargoToTransfer.quantity}
                      defaultValue={cargoToTransfer.quantity}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      onChange={(e) => {
                        setCargoToTransfer({
                          ...cargoToTransfer,
                          quantity: parseInt(e.target.value),
                        })
                      }}
                    />
                  </div>
                </div>
                <div className="sm:col-span-3">
                  {shipOptions && (
                    <SelectMenu
                      label="Select Ship"
                      options={shipOptions}
                      onChange={(value) => {
                        setCargoToTransfer({
                          ...cargoToTransfer,
                          toShipId: value,
                        })
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </form>
        )}
        {cargoToJettison && (
          <form>
            <div className="pt-8">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Jettison{' '}
                  {capitaliseFirstLetter(
                    cargoToJettison.good.toLocaleLowerCase()
                  )}
                </h3>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
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
                      max={cargoToJettison.quantity}
                      defaultValue={cargoToJettison.quantity}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      onChange={(e) => {
                        setCargoToJettison({
                          ...cargoToJettison,
                          quantity: parseInt(e.target.value),
                        })
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ManageCargo
