import moment, { Moment } from 'moment'
import { useState, useEffect, useMemo } from 'react'
import { getLocationMarketplace } from '../../api/routes/locations'
import { buyShip, listMyShips } from '../../api/routes/my'
import { getShipListings } from '../../api/routes/systems'
import { listGoodTypes, listShipTypes } from '../../api/routes/types'
import '../../App.css'
import SimpleModal from '../../components/Modal/SimpleModal'
import Select from '../../components/Select'
import LoadingRows from '../../components/Table/LoadingRows'
import { useUpdateUser } from '../../hooks/useUpdateUser'
import { MarketplaceGood } from '../../types/Location'
import { GoodType, ListGoodTypesResponse } from '../../types/Order'
import {
  ListShipListingsResponse,
  ListShipsResponse,
  ListShipTypesResponse,
  ShipListing,
} from '../../types/Ship'
import {
  abbreviateNumber,
  formatNumberCommas,
  getShipName,
} from '../../utils/helpers'
import { purchase, sell } from '../../utils/mechanics'

const STARTER_SYSTEM = 'OE'

interface GoodToProcess extends MarketplaceGood {
  shipId?: string
  quantity?: number
}

function Marketplace() {
  const [myShips, setMyShips] = useState<ListShipsResponse>()
  const [marketplace, setMarketplace] = useState<
    Map<string, { goods: MarketplaceGood[]; lastUpdated: Moment }>
  >(new Map())
  const [availableShips, setAvailableShips] =
    useState<Map<string, ListShipListingsResponse>>()

  const [filteredGood, setFilteredGood] = useState<GoodType>()

  const [goodTypes, setGoodTypes] = useState<ListGoodTypesResponse>()
  const [shipTypes, setShipTypes] = useState<ListShipTypesResponse>()

  const [goodToBuy, setGoodToBuy] = useState<GoodToProcess | null>(null)
  const [goodToSell, setGoodToSell] = useState<GoodToProcess | null>(null)
  const [shipToBuy, setShipToBuy] = useState<ShipListing | null>(null)

  const updateUser = useUpdateUser()

  useEffect(() => {
    const init = async () => {
      setMyShips(await listMyShips())
      setGoodTypes(await listGoodTypes())
      setShipTypes(await listShipTypes())
    }
    init()
  }, [])

  // console.log('goodTypes', goodTypes)
  // console.log('shipTypes', shipTypes)

  const allGoods = [...marketplace.entries()]
    .map(([, m]) => m.goods.flat())
    .flat()

  const filteredGoodDetails = useMemo(() => {
    if (!filteredGood) return
    return allGoods.find((g) => g.symbol === filteredGood)
  }, [filteredGood, allGoods])

  const shipOptions =
    myShips?.ships.map((ship) => ({
      value: ship.id,
      label: `${getShipName(ship.id)}
      `,
      tags: [
        ship.type,
        ship.location,
        `⛽ ${
          // @ts-expect-error
          ship.cargo.find((c) => GoodType[c.good] === GoodType.FUEL)
            ?.quantity ?? 0
        }`,
        `📦 ${ship.maxCargo - ship.spaceAvailable}/${ship.maxCargo}`,
      ],
      icon: (
        <div className="flex items-center justify-center w-5 h-5">
          <span className="text-xs">🚀</span>
        </div>
      ),
    })) ?? []

  const dockedLocations = useMemo(
    () => [
      ...new Set(
        myShips?.ships.map((ship) => ship.location).filter((l) => l) as string[]
      ),
    ],
    [myShips]
  )

  useEffect(() => {
    if (dockedLocations) {
      const updateMarketplace = async () => {
        const marketplaces = new Map<
          string,
          { goods: MarketplaceGood[]; lastUpdated: Moment }
        >()
        dockedLocations.forEach(async (location) => {
          const goods = (await getLocationMarketplace(location)).marketplace
          marketplaces.set(location, {
            goods,
            lastUpdated: moment(),
          })
        })
        setMarketplace(marketplaces)
      }
      updateMarketplace()
    }
  }, [dockedLocations])

  const knownSystems = useMemo(
    () => [
      ...new Set(
        [
          STARTER_SYSTEM,
          ...(myShips?.ships.map((s) => s.location?.split('-')[0]) ?? []),
        ].filter((s) => s) as string[]
      ),
    ],
    [myShips?.ships]
  )

  useEffect(() => {
    if (knownSystems) {
      const updateAvailableShips = async () => {
        const listings = new Map<string, ListShipListingsResponse>()
        knownSystems.forEach(async (system) => {
          listings.set(system, await getShipListings(system))
        })
        setAvailableShips(listings)
      }
      updateAvailableShips()
    }
  }, [knownSystems])

  const handleBuyGood = async (goodToProcess: GoodToProcess) => {
    if (!goodToProcess.shipId || !goodToProcess.quantity) {
      return
    }
    try {
      const ship = myShips?.ships.find((s) => s.id === goodToProcess.shipId)
      if (!ship) {
        throw new Error('Ship not found')
      }
      const { credits } = await purchase(
        ship,
        goodToProcess.symbol,
        goodToProcess.quantity
      )
      updateUser({ credits })
    } catch (error) {
      console.error(error)
    }
  }

  const handleSellGood = async (goodToProcess: GoodToProcess) => {
    if (!goodToProcess.shipId || !goodToProcess.quantity) {
      return
    }
    try {
      const ship = myShips?.ships.find((s) => s.id === goodToProcess.shipId)
      if (!ship) {
        throw new Error('Ship not found')
      }
      const { credits } = await sell(
        ship,
        goodToProcess.symbol,
        goodToProcess.quantity
      )
      updateUser({ credits })
    } catch (error) {
      console.error(error)
    }
  }

  const handleBuyShip = async (location: string, type: string) => {
    try {
      const result = await buyShip(location, type)
      updateUser({ credits: result.credits })
      console.log(result)
    } catch (error) {
      console.error(error)
    }
  }

  const lowestBuyPriceOfFilteredGood =
    useMemo(
      () =>
        marketplace &&
        filteredGood &&
        [...marketplace.entries()]
          .map((m) => m[1].goods)
          .flat()
          .filter((m) => m.symbol === filteredGood)
          ?.reduce(
            (a, b) => (a.sellPricePerUnit < b.sellPricePerUnit ? a : b),
            {} as MarketplaceGood
          ).purchasePricePerUnit,
      [marketplace, filteredGood]
    ) ?? 0

  const highestSellPriceOfFilteredGood =
    useMemo(
      () =>
        marketplace &&
        filteredGood &&
        [...marketplace.entries()]
          .map((m) => m[1].goods)
          .flat()
          .filter((m) => m.symbol === filteredGood)
          ?.reduce(
            (a, b) => (a.sellPricePerUnit > b.sellPricePerUnit ? a : b),
            {} as MarketplaceGood
          ).sellPricePerUnit,
      [marketplace, filteredGood]
    ) ?? 0

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
                  Trade Goods
                </h3>
                <div className="py-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-2">
                    <Select
                      label="Filter by Good"
                      options={[
                        ...new Set(
                          [...marketplace.entries()]
                            .map(([, m]) => m.goods.map((g) => g.symbol).flat())
                            .flat()
                        ),
                      ].map((symbol) => ({
                        value: symbol,
                        // @ts-expect-error
                        label: GoodType[symbol] ?? symbol,
                      }))}
                      value={filteredGood}
                      onChange={(value) => {
                        setFilteredGood(value as GoodType)
                      }}
                    />
                  </div>
                  {filteredGood && (
                    <div className="sm:col-span-3">
                      <h3 className="text-sm font-medium text-gray-700">
                        Best Profit Margin
                      </h3>
                      <p className="mt-2 py-1 text-sm leading-5 text-gray-500">
                        {formatNumberCommas(lowestBuyPriceOfFilteredGood)}
                        {' → '}
                        {formatNumberCommas(
                          highestSellPriceOfFilteredGood
                        )}{' '}
                        <span className="ml-2 text-gray-900">Margin</span>{' '}
                        {formatNumberCommas(
                          highestSellPriceOfFilteredGood -
                            lowestBuyPriceOfFilteredGood
                        )}{' '}
                        {filteredGoodDetails &&
                        filteredGoodDetails.volumePerUnit > 1 ? (
                          <>
                            <span className="ml-2 text-gray-900">
                              Per volume
                            </span>{' '}
                            {formatNumberCommas(
                              Math.floor(
                                (highestSellPriceOfFilteredGood -
                                  lowestBuyPriceOfFilteredGood) /
                                  filteredGoodDetails.volumePerUnit
                              )
                            )}
                            <span className="ml-2 text-gray-900">
                              Per 80 units
                            </span>{' '}
                            {formatNumberCommas(
                              Math.floor(
                                ((highestSellPriceOfFilteredGood -
                                  lowestBuyPriceOfFilteredGood) *
                                  80) /
                                  filteredGoodDetails.volumePerUnit
                              )
                            )}
                          </>
                        ) : (
                          <>
                            <span className="ml-2 text-gray-900">
                              Per 80 units
                            </span>{' '}
                            {formatNumberCommas(
                              Math.floor(
                                (highestSellPriceOfFilteredGood -
                                  lowestBuyPriceOfFilteredGood) *
                                  80
                              )
                            )}
                          </>
                        )}
                      </p>
                    </div>
                  )}
                </div>
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
                              Quantity Available
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
                          {marketplace &&
                            [...marketplace.entries()]
                              .sort((a, b) => a[0].localeCompare(b[0]))
                              .map(([location, market]) => (
                                <>
                                  <tr key={location} className="bg-gray-100">
                                    <td
                                      className="px-6 py-2 whitespace-nowrap text-sm leading-5 text-gray-500"
                                      colSpan={9}
                                    >
                                      <div className="flex justify-between">
                                        <span>{location}</span>
                                        <span>
                                          Last updated:{' '}
                                          {market.lastUpdated.format(
                                            'DD/MM/YYYY hh:mm:ss a'
                                          )}
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                  <>
                                    {market ? (
                                      market.goods
                                        .filter((g) =>
                                          filteredGood
                                            ? g.symbol === filteredGood
                                            : true
                                        )
                                        ?.sort((a, b) =>
                                          a.symbol.localeCompare(b.symbol)
                                        )
                                        .map((locationMarketplace, i) => (
                                          <tr
                                            key={`${location}-${locationMarketplace.symbol}`}
                                            className={
                                              i % 2 === 0
                                                ? 'bg-white'
                                                : 'bg-gray-50'
                                            }
                                          >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 font-medium text-gray-900">
                                              {
                                                GoodType[
                                                  // @ts-expect-error
                                                  locationMarketplace.symbol
                                                ]
                                              }
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                              {abbreviateNumber(
                                                locationMarketplace.quantityAvailable
                                              )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                              {formatNumberCommas(
                                                locationMarketplace.volumePerUnit
                                              )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                              {abbreviateNumber(
                                                locationMarketplace.pricePerUnit
                                              )}
                                            </td>
                                            <td
                                              className={
                                                'px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500' +
                                                ([...marketplace.entries()]
                                                  .map((m) => m[1].goods)
                                                  .flat()
                                                  .filter(
                                                    (m) =>
                                                      m.symbol ===
                                                      locationMarketplace.symbol
                                                  )
                                                  ?.reduce((a, b) =>
                                                    a.purchasePricePerUnit <
                                                    b.purchasePricePerUnit
                                                      ? a
                                                      : b
                                                  ).purchasePricePerUnit ===
                                                locationMarketplace.purchasePricePerUnit
                                                  ? ' text-green-500'
                                                  : '')
                                              }
                                            >
                                              {abbreviateNumber(
                                                locationMarketplace.purchasePricePerUnit
                                              )}
                                            </td>
                                            <td
                                              className={
                                                'px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500' +
                                                ([...marketplace.entries()]
                                                  .map((m) => m[1].goods)
                                                  .flat()
                                                  .filter(
                                                    (m) =>
                                                      m.symbol ===
                                                      locationMarketplace.symbol
                                                  )
                                                  ?.reduce((a, b) =>
                                                    a.sellPricePerUnit >
                                                    b.sellPricePerUnit
                                                      ? a
                                                      : b
                                                  ).sellPricePerUnit ===
                                                locationMarketplace.sellPricePerUnit
                                                  ? ' text-green-500'
                                                  : '')
                                              }
                                            >
                                              {abbreviateNumber(
                                                locationMarketplace.sellPricePerUnit
                                              )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                              {formatNumberCommas(
                                                locationMarketplace.spread
                                              )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                              <button
                                                className="text-indigo-600 hover:text-indigo-900"
                                                onClick={() => {
                                                  setGoodToBuy(
                                                    locationMarketplace
                                                  )
                                                }}
                                              >
                                                Buy
                                              </button>
                                              <button
                                                className="ml-4 text-emerald-600 hover:text-emerald-900"
                                                onClick={() => {
                                                  setGoodToSell(
                                                    locationMarketplace
                                                  )
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
                                  </>
                                </>
                              ))}
                          {/* No markets available. You must have at least one
                                    ship docked at a location to buy or sell goods. */}
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
                              Restricted Goods
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
                              Loading Speed
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Speed / Weapons / Plating
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
                          {availableShips &&
                            [...availableShips.entries()].map(
                              ([system, ships]) => (
                                <>
                                  <tr key={system} className="bg-gray-100">
                                    <td
                                      className="px-6 py-2 whitespace-nowrap text-sm leading-5 text-gray-500"
                                      colSpan={10}
                                    >
                                      {system}
                                    </td>
                                  </tr>
                                  {ships ? (
                                    ships.shipListings
                                      ?.sort((a, b) =>
                                        a.type.localeCompare(b.type)
                                      )
                                      .map((ship, i) => (
                                        <tr
                                          key={`${system}-${ship.type}`}
                                          className={
                                            i % 2 === 0
                                              ? 'bg-white'
                                              : 'bg-gray-50'
                                          }
                                        >
                                          <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 font-medium text-gray-900">
                                            {ship.type}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                            {ship.class}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                            {ship.manufacturer}
                                          </td>
                                          <td className="px-6 py-4 text-sm leading-5 text-gray-500">
                                            {ship.purchaseLocations
                                              .map((pl) => pl.location)
                                              .join(', ')}
                                          </td>
                                          <td
                                            className={
                                              'px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500' +
                                              (ship.restrictedGoods
                                                ? ' text-red-500'
                                                : '')
                                            }
                                          >
                                            {ship.restrictedGoods
                                              // @ts-expect-error
                                              ?.map((good) => GoodType[good])
                                              .join(', ') ?? 'None'}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                            {!ship.purchaseLocations
                                              .map((pl) => pl.price)
                                              .every(
                                                (p) =>
                                                  p ===
                                                  ship.purchaseLocations[0]
                                                    .price
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
                                                  .map((p) =>
                                                    formatNumberCommas(p)
                                                  )
                                                  .join(' - ')
                                              : formatNumberCommas(
                                                  ship.purchaseLocations[0]
                                                    .price
                                                )}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                            {formatNumberCommas(ship.maxCargo)}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                            {formatNumberCommas(
                                              ship.loadingSpeed
                                            )}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                            {formatNumberCommas(ship.speed)} /{' '}
                                            {formatNumberCommas(ship.weapons)} /{' '}
                                            {formatNumberCommas(ship.plating)}
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
                                </>
                              )
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
              <div className="sm:col-span-3">
                <Select
                  label="Select Ship"
                  options={shipOptions}
                  value={goodToBuy.shipId}
                  onChange={(value) => {
                    setGoodToBuy({
                      ...goodToBuy,
                      shipId: value,
                    })
                  }}
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  className="mt-1 form-input w-full"
                  type="number"
                  min={1}
                  max={goodToBuy.quantityAvailable}
                  defaultValue={
                    myShips?.ships.find((s) => s.id === goodToBuy.shipId)
                      ?.spaceAvailable
                  }
                  onChange={(e) =>
                    setGoodToBuy({
                      ...goodToBuy,
                      quantity: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              {goodToBuy.quantity && (
                <p className="mt-4">
                  Total cost{' '}
                  <strong>
                    {formatNumberCommas(
                      goodToBuy.quantity * goodToBuy.purchasePricePerUnit
                    )}
                  </strong>{' '}
                  credits
                </p>
              )}
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

              <div className="sm:col-span-3">
                <Select
                  label="Select Ship"
                  options={shipOptions}
                  value={goodToSell.shipId}
                  onChange={(value) => {
                    setGoodToSell({
                      ...goodToSell,
                      shipId: value,
                    })
                  }}
                />
              </div>
              {myShips?.ships.find((s) => s.id === goodToSell.shipId) && (
                <span className="block text-sm font-medium text-gray-700">
                  Ship has{' '}
                  {myShips?.ships
                    .find((s) => s.id === goodToSell.shipId)
                    ?.cargo?.find((c) => c.good === goodToSell.symbol)
                    ?.quantity ?? 0}{' '}
                  {goodToSell.symbol}
                </span>
              )}
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
              {goodToSell.quantity && (
                <p className="mt-4">
                  Total sale{' '}
                  <strong>
                    {formatNumberCommas(
                      goodToSell.quantity * goodToSell.sellPricePerUnit
                    )}
                  </strong>{' '}
                  credits
                </p>
              )}
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
                <div key={pl.location} className="mt-4">
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
