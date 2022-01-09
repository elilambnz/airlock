import React, { useState, useEffect } from 'react'
import { getLocationMarketplace } from '../../api/routes/locations'
import {
  buyShip,
  createPurchaseOrder,
  createSellOrder,
  listMyShips,
} from '../../api/routes/my'
import { getShipListings } from '../../api/routes/systems'
import { listGoodTypes, listShipTypes } from '../../api/routes/types'
import '../../App.css'
import SimpleModal from '../../components/Modal/SimpleModal'
import SelectMenu from '../../components/SelectMenu'
import LoadingRows from '../../components/Table/LoadingRows'
import {
  LocationMarketplace,
  LocationMarketplaceResponse,
} from '../../types/Location'
import { ListGoodTypesResponse } from '../../types/Order'
import {
  ListShipListingsResponse,
  ListShipsResponse,
  ListShipTypesResponse,
  ShipListing,
} from '../../types/Ship'
import { formatThousands } from '../../utils/helpers'

const START_CURRENT_SYSTEM = 'OE'
const START_CURRENT_LOCATION = 'OE-PM-TR'

interface GoodToProccess extends LocationMarketplace {
  shipId?: string
  quantity?: number
}

function Marketplace() {
  const [availableShips, setAvailableShips] =
    useState<ListShipListingsResponse>()
  const [marketplace, setMarketplace] = useState<LocationMarketplaceResponse>()
  const [myShips, setMyShips] = useState<ListShipsResponse>()

  const [goodTypes, setGoodTypes] = useState<ListGoodTypesResponse>()
  const [shipTypes, setShipTypes] = useState<ListShipTypesResponse>()

  const [goodToBuy, setGoodToBuy] = useState<GoodToProccess | null>(null)
  const [goodToSell, setGoodToSell] = useState<GoodToProccess | null>(null)
  const [shipToBuy, setShipToBuy] = useState<ShipListing | null>(null)

  useEffect(() => {
    const init = async () => {
      setAvailableShips(await getShipListings(START_CURRENT_SYSTEM))
      setMarketplace(await getLocationMarketplace(START_CURRENT_LOCATION))
      setMyShips(await listMyShips())
      setGoodTypes(await listGoodTypes())
      setShipTypes(await listShipTypes())
    }
    init()
  }, [])

  const shipOptions = myShips?.ships.map((ship) => ({
    value: ship.id,
    label: `${ship.type} (${ship.maxCargo - ship.spaceAvailable}/${
      ship.maxCargo
    }) [${ship.cargo.find((cargo) => cargo.good === 'FUEL')?.quantity ?? 0}]`,
  }))

  const handleBuyGood = async (goodToProccess: GoodToProccess) => {
    if (!goodToProccess.shipId || !goodToProccess.quantity) {
      return
    }
    try {
      const result = await createPurchaseOrder(
        goodToProccess.shipId,
        goodToProccess.symbol,
        goodToProccess.quantity
      )
      console.log(result)
    } catch (error) {
      console.error(error)
    }
  }

  const handleSellGood = async (goodToProccess: GoodToProccess) => {
    if (!goodToProccess.shipId || !goodToProccess.quantity) {
      return
    }
    try {
      const result = await createSellOrder(
        goodToProccess.shipId,
        goodToProccess.symbol,
        goodToProccess.quantity
      )
      console.log(result)
    } catch (error) {
      console.error(error)
    }
  }

  const handleBuyShip = async (location: string, type: string) => {
    try {
      const result = await buyShip(location, type)
      console.log(result)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
        </div>
      </header>
      <main>
        <div className="bg-gray-100 min-h-screen">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto py-6">
              <h2 className="text-2xl font-bold text-gray-900">Goods</h2>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Buy Goods
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {START_CURRENT_LOCATION}
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
                              Symbol
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Price/Unit
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Purchase Price/Unit
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Sell Price/Unit
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Volume/Unit
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Quantity Available
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Spread
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
                          {marketplace ? (
                            marketplace.marketplace
                              .sort((a, b) => a.symbol.localeCompare(b.symbol))
                              .map((locationMarketplace, i) => (
                                <tr
                                  key={locationMarketplace.symbol}
                                  className={
                                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                  }
                                >
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 font-medium text-gray-900">
                                    {locationMarketplace.symbol}
                                  </td>
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                    {formatThousands(
                                      locationMarketplace.pricePerUnit
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                    {formatThousands(
                                      locationMarketplace.purchasePricePerUnit
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                    {formatThousands(
                                      locationMarketplace.sellPricePerUnit
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                    {formatThousands(
                                      locationMarketplace.volumePerUnit
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                    {formatThousands(
                                      locationMarketplace.quantityAvailable
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                    {formatThousands(
                                      locationMarketplace.spread
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                      className="text-indigo-600 hover:text-indigo-900"
                                      onClick={() => {
                                        setGoodToBuy(locationMarketplace)
                                      }}
                                    >
                                      Buy
                                    </button>
                                  </td>
                                </tr>
                              ))
                          ) : (
                            <LoadingRows cols={8} rows={3} />
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg my-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Sell Goods
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {START_CURRENT_LOCATION}
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
                              Symbol
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Price/Unit
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Purchase Price/Unit
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Sell Price/Unit
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Volume/Unit
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Quantity Available
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Spread
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
                          {marketplace ? (
                            marketplace.marketplace
                              .sort((a, b) => a.symbol.localeCompare(b.symbol))
                              .map((locationMarketplace, i) => (
                                <tr
                                  key={locationMarketplace.symbol}
                                  className={
                                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                  }
                                >
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 font-medium text-gray-900">
                                    {locationMarketplace.symbol}
                                  </td>
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                    {formatThousands(
                                      locationMarketplace.pricePerUnit
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                    {formatThousands(
                                      locationMarketplace.purchasePricePerUnit
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                    {formatThousands(
                                      locationMarketplace.sellPricePerUnit
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                    {formatThousands(
                                      locationMarketplace.volumePerUnit
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                    {formatThousands(
                                      locationMarketplace.quantityAvailable
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                    {formatThousands(
                                      locationMarketplace.spread
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                      className="text-indigo-600 hover:text-indigo-900"
                                      onClick={() => {
                                        setGoodToSell(locationMarketplace)
                                      }}
                                    >
                                      Sell
                                    </button>
                                  </td>
                                </tr>
                              ))
                          ) : (
                            <LoadingRows cols={8} rows={3} />
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto py-6">
              <h2 className="text-2xl font-bold text-gray-900">Ships</h2>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Buy Ships
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {START_CURRENT_SYSTEM}
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
                              Type
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Class
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Manufacturer
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Purchase Location
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Price
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Max Cargo
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Speed
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Weapons
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Plating
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
                          {availableShips ? (
                            availableShips.shipListings
                              ?.sort((a, b) => a.type.localeCompare(b.type))
                              .map((ship, i) => (
                                <tr
                                  key={ship.type}
                                  className={
                                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                  }
                                >
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 font-medium text-gray-900">
                                    {ship.type}
                                  </td>
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                    {ship.class}
                                  </td>
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                    {ship.manufacturer}
                                  </td>
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                    {ship.purchaseLocations
                                      .map((pl) => pl.location)
                                      .join(', ')}
                                  </td>
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                    {!ship.purchaseLocations
                                      .map((pl) => pl.price)
                                      .every(
                                        (p) =>
                                          p === ship.purchaseLocations[0].price
                                      )
                                      ? [
                                          Math.min(
                                            ...ship.purchaseLocations.map(
                                              (pl) => pl.price
                                            )
                                          ),
                                          Math.max(
                                            ...ship.purchaseLocations.map(
                                              (pl) => pl.price
                                            )
                                          ),
                                        ]
                                          .map((p) => formatThousands(p))
                                          .join(' - ')
                                      : formatThousands(
                                          ship.purchaseLocations[0].price
                                        )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                    {formatThousands(ship.maxCargo)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                    {formatThousands(ship.speed)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                    {formatThousands(ship.weapons)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                    {formatThousands(ship.plating)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                      className="text-indigo-600 hover:text-indigo-900"
                                      onClick={() => {
                                        setShipToBuy(ship)
                                      }}
                                    >
                                      Buy
                                    </button>
                                  </td>
                                </tr>
                              ))
                          ) : (
                            <LoadingRows cols={10} />
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
      {goodToBuy && (
        <SimpleModal
          title="Buy Goods"
          content={
            <div>
              <p>
                You are buying <strong>{goodToBuy.symbol}</strong>
              </p>
              <p>
                <strong>{goodToBuy.purchasePricePerUnit}</strong> credits per
                unit
              </p>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  className="mt-1 form-input w-full"
                  type="number"
                  min={1}
                  max={goodToBuy.quantityAvailable}
                  onChange={(e) =>
                    setGoodToBuy({
                      ...goodToBuy,
                      quantity: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="sm:col-span-3">
                {shipOptions && (
                  <SelectMenu
                    label="Select Ship"
                    options={shipOptions}
                    onChange={(value) => {
                      setGoodToBuy({
                        ...goodToBuy,
                        shipId: value,
                      })
                    }}
                  />
                )}
              </div>
              <button className="m-4" onClick={() => setGoodToBuy(null)}>
                Cancel
              </button>
              <button
                className="m-4"
                onClick={() => {
                  handleBuyGood(goodToBuy)
                }}
              >
                Buy
              </button>
            </div>
          }
          handleClose={() => setGoodToBuy(null)}
        />
      )}
      {goodToSell && (
        <SimpleModal
          title="Sell Goods"
          content={
            <div>
              <p>
                You are selling <strong>{goodToSell.symbol}</strong>
              </p>
              <p>
                <strong>{goodToSell.sellPricePerUnit}</strong> credits per unit
              </p>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  className="mt-1 form-input w-full"
                  type="number"
                  min={1}
                  onChange={(e) =>
                    setGoodToSell({
                      ...goodToSell,
                      quantity: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="sm:col-span-3">
                {shipOptions && (
                  <SelectMenu
                    label="Select Ship"
                    options={shipOptions}
                    onChange={(value) => {
                      setGoodToSell({
                        ...goodToSell,
                        shipId: value,
                      })
                    }}
                  />
                )}
              </div>
              <button className="m-4" onClick={() => setGoodToSell(null)}>
                Cancel
              </button>
              <button
                className="m-4"
                onClick={() => {
                  handleSellGood(goodToSell)
                }}
              >
                Sell
              </button>
            </div>
          }
          handleClose={() => setGoodToSell(null)}
        />
      )}
      {shipToBuy && (
        <SimpleModal
          title="Buy Ship"
          content={
            <div>
              <p>
                You are buying <strong>{shipToBuy.type}</strong>
              </p>
              {shipToBuy.purchaseLocations.map((pl) => (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    {pl.location}
                  </label>
                  <div className="mt-1">
                    <p>
                      <strong>{pl.price}</strong> credits
                    </p>
                    <button
                      className="m-4"
                      onClick={() => {
                        handleBuyShip(pl.location, shipToBuy.type)
                      }}
                    >
                      Buy
                    </button>
                  </div>
                </div>
              ))}

              <button className="m-4" onClick={() => setShipToBuy(null)}>
                Cancel
              </button>
            </div>
          }
          handleClose={() => setShipToBuy(null)}
        />
      )}
    </>
  )
}

export default Marketplace
