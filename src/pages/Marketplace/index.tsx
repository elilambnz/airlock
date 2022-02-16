import { useState, useMemo, useContext } from 'react'
import { useMutation, useQueries, useQuery, useQueryClient } from 'react-query'
import { getLocationMarketplace } from '../../api/routes/locations'
import { buyShip, listMyShips } from '../../api/routes/my'
import { getShipListings } from '../../api/routes/systems'
import { listGoodTypes } from '../../api/routes/types'
import '../../App.css'
import Modal from '../../components/Modal/index'
import Select from '../../components/Select'
import LoadingRows from '../../components/Table/LoadingRows'
import { MarketplaceGood, System } from '../../types/Location'
import { GoodType } from '../../types/Order'
import { Ship, ShipListing } from '../../types/Ship'
import {
  abbreviateNumber,
  formatNumberCommas,
  getErrorMessage,
  getShipName,
} from '../../utils/helpers'
import { purchase, sell } from '../../utils/mechanics'
import moment from 'moment'
import {
  CreditCardIcon,
  CubeIcon,
  FireIcon,
  GlobeIcon,
  HeartIcon,
  LightningBoltIcon,
  OfficeBuildingIcon,
  ShoppingBagIcon,
  TrendingUpIcon,
  TruckIcon,
} from '@heroicons/react/solid'
import {
  NotificationContext,
  NotificationType,
} from '../../providers/NotificationProvider'
import LoadingSpinner from '../../components/LoadingSpinner'

interface GoodToProcess extends MarketplaceGood {
  location?: string
  shipId?: string
  quantity?: number
}

export default function Marketplace() {
  const [filteredGood, setFilteredGood] = useState<GoodType>()
  const [volume, setVolume] = useState(80)

  const [goodToBuy, setGoodToBuy] = useState<GoodToProcess | null>(null)
  const [goodToSell, setGoodToSell] = useState<GoodToProcess | null>(null)
  const [shipToBuy, setShipToBuy] = useState<ShipListing | null>(null)

  const { push } = useContext(NotificationContext)

  const queryClient = useQueryClient()
  const myShips = useQuery('myShips', listMyShips)

  const dockedLocations = useMemo(
    () => [
      ...new Set(
        myShips.data?.ships
          .map((ship) => ship.location)
          .filter(Boolean)
          ?.sort((a, b) => a!.localeCompare(b!)) as string[]
      ),
    ],
    [myShips]
  )

  const marketplace = useQueries(
    dockedLocations.map((location) => ({
      queryKey: ['locationMarketplace', location],
      queryFn: () => getLocationMarketplace(location),
    }))
  )

  const knownSystems = useMemo(
    () => [
      ...new Set(
        [
          System[0],
          ...(myShips.data?.ships.map((s) => s.location?.split('-')[0]) ?? []),
        ]
          .filter(Boolean)
          ?.sort(
            (a, b) =>
              Object.keys(System).indexOf(a!) - Object.keys(System).indexOf(b!)
          ) as string[]
      ),
    ],
    [myShips.data?.ships]
  )

  const availableShips = useQueries(
    knownSystems.map((system) => ({
      queryKey: ['shipListings', system],
      queryFn: () => getShipListings(system),
    }))
  )

  const goodTypes = useQuery('goodTypes', listGoodTypes)
  // const shipTypes = useQuery('shipTypes', listShipTypes)

  const filteredGoodDetails = useMemo(() => {
    if (!filteredGood) return
    return goodTypes.data?.goods.find((g) => g.symbol === filteredGood)
  }, [filteredGood, goodTypes])

  const isFirstShip = useMemo(() => {
    return shipToBuy?.purchaseLocations && myShips.data?.ships.length === 0
  }, [shipToBuy, myShips.data?.ships])

  const shipOptions =
    myShips.data?.ships
      .filter(
        (s) =>
          !!s.location &&
          (s.location === goodToBuy?.location ||
            s.location === goodToSell?.location ||
            shipToBuy?.purchaseLocations.find(
              (pl) => pl.location === s.location
            ))
      )
      ?.map((ship) => ({
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

  const handleBuyGood = useMutation(
    ({
      ship,
      symbol,
      quantity,
    }: {
      ship: Ship
      symbol: GoodType
      quantity: number
    }) => purchase(ship, symbol, quantity),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries('user')
        queryClient.invalidateQueries('myShips')
        const { ship, symbol, quantity } = variables
        push({
          title: 'Successfully purchased goods',
          message: `${getShipName(ship.id)} has purchased ${quantity} ${
            GoodType[symbol as unknown as keyof typeof GoodType]
          }`,
          type: NotificationType.Success,
        })
      },
      onError: (error: any) => {
        push({
          title: 'Error',
          message: getErrorMessage(error),
          type: NotificationType.Error,
        })
      },
    }
  )

  const handleSellGood = useMutation(
    ({
      ship,
      symbol,
      quantity,
    }: {
      ship: Ship
      symbol: GoodType
      quantity: number
    }) => sell(ship, symbol, quantity),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries('user')
        queryClient.invalidateQueries('myShips')
        const { ship, symbol, quantity } = variables
        push({
          title: 'Successfully sold goods',
          message: `${getShipName(ship.id)} has sold ${quantity} ${
            GoodType[symbol as unknown as keyof typeof GoodType]
          }`,
          type: NotificationType.Success,
        })
      },
      onError: (error: any) => {
        push({
          title: 'Error',
          message: getErrorMessage(error),
          type: NotificationType.Error,
        })
      },
    }
  )

  const handleBuyShip = useMutation(
    ({ location, type }: { location: string; type: string }) =>
      buyShip(location, type),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('user')
        queryClient.invalidateQueries('myShips')
        const { ship } = data
        push({
          title: 'Successfully purchased ship',
          message: `Ship ${getShipName(ship.id)} now docked at ${
            ship.location
          }`,
          type: NotificationType.Success,
        })
      },
      onError: (error: any) => {
        push({
          title: 'Error',
          message: getErrorMessage(error),
          type: NotificationType.Error,
        })
      },
    }
  )

  const lowestBuyPriceOfFilteredGood =
    useMemo(
      () =>
        marketplace &&
        filteredGood &&
        marketplace
          .flatMap((m) => m.data?.marketplace)
          .filter((m) => m && m.symbol === filteredGood)
          ?.reduce(
            (a, b) =>
              a!.purchasePricePerUnit < b!.purchasePricePerUnit ? a : b,
            {} as MarketplaceGood
          )?.purchasePricePerUnit,
      [marketplace, filteredGood]
    ) ?? 0

  const highestSellPriceOfFilteredGood =
    useMemo(
      () =>
        marketplace &&
        filteredGood &&
        marketplace
          .flatMap((m) => m.data?.marketplace)
          .filter((m) => m && m.symbol === filteredGood)
          ?.reduce(
            (a, b) => (a!.sellPricePerUnit > b!.sellPricePerUnit ? a : b),
            {} as MarketplaceGood
          )?.sellPricePerUnit,
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
        <div
          className="bg-gray-100"
          style={{
            minHeight: 'calc(100vh - 148px)',
          }}
        >
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto py-6">
              <h2 className="text-2xl font-bold text-gray-900">Goods</h2>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Trade Goods
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Generate profit by trading goods or buying resources for your
                  structures.
                </p>
                <div className="py-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-2">
                    <Select
                      label="Filter by Good"
                      options={
                        goodTypes.data?.goods.map((g) => ({
                          label: g.name,
                          value: g.symbol,
                        })) ?? []
                      }
                      value={filteredGood}
                      onChange={(value) => {
                        setFilteredGood(value as GoodType)
                      }}
                      onClear={() => {
                        setFilteredGood(undefined)
                      }}
                    />
                  </div>
                  {filteredGoodDetails && (
                    <div className="sm:col-span-4">
                      <h3 className="text-sm font-medium text-gray-700">
                        Best Profit Margin
                      </h3>
                      <div className="flex items-center mt-2 py-1 text-sm leading-5 text-gray-500">
                        <span className="inline-flex items-center">
                          <span className="sr-only">Trade</span>
                          <TrendingUpIcon className="mr-1 w-4 h-4 text-gray-900" />{' '}
                          {formatNumberCommas(lowestBuyPriceOfFilteredGood)}
                          {' → '}
                          {formatNumberCommas(highestSellPriceOfFilteredGood)}
                        </span>
                        <span className="ml-4 mr-1 text-gray-900">Margin</span>{' '}
                        {formatNumberCommas(
                          highestSellPriceOfFilteredGood -
                            lowestBuyPriceOfFilteredGood
                        )}
                        <div className="inline-flex items-center">
                          <span className="ml-1">{' × '}</span>
                          <input
                            type="number"
                            name="volume"
                            id="volume"
                            className="block w-12 h-6 mx-1 px-1 text-sm border-0 border-b border-transparent bg-gray-50 focus:border-indigo-600 focus:ring-0"
                            style={
                              volume > 99 && volume < 999
                                ? { width: '4rem' }
                                : volume > 999
                                ? { width: '5rem' }
                                : {}
                            }
                            value={volume}
                            min={1}
                            onChange={(e) => {
                              setVolume(parseInt(e.target.value))
                            }}
                          />
                          <span className="mr-1">{' = '}</span>
                        </div>
                        {formatNumberCommas(
                          Math.floor(
                            (highestSellPriceOfFilteredGood -
                              lowestBuyPriceOfFilteredGood) *
                              volume
                          )
                        )}
                        <span className="sr-only">Volume</span>
                        <CubeIcon className="ml-4 mr-1 w-4 h-4 text-gray-900" />{' '}
                        {formatNumberCommas(
                          Math.floor(volume * filteredGoodDetails.volumePerUnit)
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg"></div>
                    {myShips.isLoading || marketplace.length > 0 ? (
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
                          {myShips.isLoading && (
                            <LoadingRows cols={8} rows={3} />
                          )}
                          {marketplace.map((m, i) => (
                            <>
                              <tr
                                key={dockedLocations[i]}
                                className="bg-gray-100"
                              >
                                <td
                                  className="px-6 py-2 whitespace-nowrap text-sm leading-5 text-gray-500"
                                  colSpan={9}
                                >
                                  <div className="flex justify-between items-baseline">
                                    <span>{dockedLocations[i]}</span>
                                    <span className="text-xs">
                                      Last updated:{' '}
                                      {moment(m.dataUpdatedAt).format(
                                        'DD/MM/YY hh:mm:ss a'
                                      )}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                              <>
                                {!m.isLoading ? (
                                  m.data?.marketplace
                                    .filter((g) =>
                                      filteredGood
                                        ? g.symbol === filteredGood
                                        : true
                                    )
                                    ?.sort((a, b) =>
                                      a.symbol.localeCompare(b.symbol)
                                    )
                                    .map((locationMarketplace, j) => (
                                      <tr
                                        key={`${dockedLocations[i]}-${locationMarketplace.symbol}`}
                                        className={
                                          j % 2 === 0
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
                                            (marketplace
                                              .filter((m) => !!m.data)
                                              ?.flatMap(
                                                (m) => m.data!.marketplace
                                              )
                                              .filter(
                                                (g) =>
                                                  g.symbol ===
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
                                            (marketplace
                                              .filter((m) => !!m.data)
                                              ?.flatMap(
                                                (m) => m.data!.marketplace
                                              )
                                              .filter(
                                                (g) =>
                                                  g.symbol ===
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
                                              setGoodToBuy({
                                                ...locationMarketplace,
                                                location: dockedLocations[i],
                                              })
                                            }}
                                          >
                                            Buy
                                          </button>
                                          <button
                                            className="ml-4 text-emerald-600 hover:text-emerald-900"
                                            onClick={() => {
                                              setGoodToSell({
                                                ...locationMarketplace,
                                                location: dockedLocations[i],
                                              })
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
                        </tbody>
                      </table>
                    ) : (
                      <div className="flex justify-center">
                        <div className="w-full py-8 px-4">
                          <div className="flex flex-col items-center text-center mb-4">
                            <ShoppingBagIcon className="w-12 h-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                              No markets available!
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              You must have at least one ship docked at a
                              location to buy or sell goods.{' '}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
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
                  Increase your fleet size by buying new ships.
                </p>
              </div>
              <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                      {availableShips.length > 0 ? (
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
                            {availableShips.map((listings, i) => (
                              <>
                                <tr
                                  key={knownSystems[i]}
                                  className="bg-gray-100"
                                >
                                  <td
                                    className="px-6 py-2 whitespace-nowrap text-sm leading-5 text-gray-500"
                                    colSpan={10}
                                  >
                                    <div className="flex justify-between items-baseline">
                                      <span>{knownSystems[i]}</span>
                                      <span className="text-xs">
                                        Last updated:{' '}
                                        {moment(listings.dataUpdatedAt).format(
                                          'DD/MM/YY hh:mm:ss a'
                                        )}
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                                {!listings.isLoading ? (
                                  listings.data?.shipListings
                                    ?.sort((a, b) =>
                                      a.type.localeCompare(b.type)
                                    )
                                    .map((ship, j) => (
                                      <tr
                                        key={ship.type}
                                        className={
                                          j % 2 === 0
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
                                                ship.purchaseLocations[0].price
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
                                                ship.purchaseLocations[0].price
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
                                  <LoadingRows cols={10} rows={3} />
                                )}
                              </>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="flex justify-center">
                          <div className="w-full">
                            <div className="bg-white py-8 px-4 shadow rounded-lg">
                              <div className="text-center mb-4">
                                <h1 className="text-2xl font-bold">
                                  No ships available!
                                </h1>
                              </div>
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
        </div>
      </main>
      <Modal
        open={!!goodToBuy}
        title="Buy Goods"
        content={
          <>
            {goodToBuy && (
              <div className="mt-4 px-4 py-2">
                <form>
                  <div>
                    <h3 className="text-md font-medium text-gray-900">
                      {/* @ts-expect-error */}
                      Buy {GoodType[goodToBuy.symbol]}
                    </h3>
                  </div>
                  <div className="flex items-center mt-2 py-1 text-sm leading-5 text-gray-500">
                    <span className="inline-flex items-center">
                      <span className="sr-only">Location</span>
                      <GlobeIcon className="mr-1 w-4 h-4 text-gray-900" />{' '}
                      {goodToBuy.location}
                    </span>
                    <span className="ml-4 inline-flex items-center">
                      <span className="sr-only">Purchase price per unit</span>
                      <CreditCardIcon className="mr-1 w-4 h-4 text-gray-900" />{' '}
                      {formatNumberCommas(goodToBuy.purchasePricePerUnit)}
                    </span>
                    <span className="ml-4 inline-flex items-center">
                      <span className="sr-only">Volume per unit</span>
                      <CubeIcon className="mr-1 w-4 h-4 text-gray-900" />{' '}
                      {formatNumberCommas(goodToBuy.volumePerUnit)}
                    </span>
                  </div>
                  {shipOptions.length > 0 ? (
                    <>
                      <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-4">
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
                        <div className="sm:col-span-2">
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
                              max={goodToBuy.quantityAvailable}
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              onChange={(e) => {
                                const quantity = !isNaN(
                                  parseInt(e.target.value)
                                )
                                  ? parseInt(e.target.value)
                                  : 0
                                setGoodToBuy({
                                  ...goodToBuy,
                                  quantity,
                                })
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="pt-6 sm:col-span-6">
                          <button
                            type="submit"
                            className={
                              'truncate inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' +
                              (goodToBuy.quantity === 0 ||
                              !goodToBuy.shipId ||
                              handleBuyGood.isLoading
                                ? ' opacity-50 cursor-not-allowed'
                                : '')
                            }
                            disabled={
                              goodToBuy.quantity === 0 ||
                              !goodToBuy.shipId ||
                              handleBuyGood.isLoading
                            }
                            onClick={(e) => {
                              e.preventDefault()
                              const ship = myShips.data?.ships.find(
                                (s) => s.id === goodToBuy.shipId
                              )
                              if (!ship) {
                                throw new Error('Ship not found')
                              }
                              handleBuyGood.mutate({
                                ship,
                                symbol: goodToBuy.symbol,
                                quantity: goodToBuy.quantity ?? 0,
                              })
                            }}
                          >
                            {!handleBuyGood.isLoading ? (
                              `Buy ${
                                !!goodToBuy.quantity && goodToBuy.quantity > 0
                                  ? `${formatNumberCommas(
                                      goodToBuy.quantity
                                    )} ${
                                      GoodType[
                                        goodToBuy.symbol as unknown as keyof typeof GoodType
                                      ]
                                    }
                            for ${formatNumberCommas(
                              goodToBuy.quantity *
                                goodToBuy.purchasePricePerUnit
                            )} units`
                                  : ''
                              }`
                            ) : (
                              <>
                                Placing purchase order
                                <div className="ml-2">
                                  <LoadingSpinner />
                                </div>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-center">
                      <div className="w-full py-4">
                        <div className="flex flex-col items-center text-center mb-4">
                          <h3 className="mt-2 text-sm font-medium text-gray-900">
                            No ships available to buy goods.
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Ships must be docked in this location to buy goods.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            )}
          </>
        }
        onClose={() => setGoodToBuy(null)}
        className="w-full md:max-w-xl"
      />
      <Modal
        open={!!goodToSell}
        title="Sell Goods"
        content={
          <>
            {goodToSell && (
              <div className="mt-4 px-4 py-2">
                <form>
                  <div>
                    <h3 className="text-md font-medium text-gray-900">
                      {/* @ts-expect-error */}
                      Sell {GoodType[goodToSell.symbol]}
                    </h3>
                  </div>
                  <div className="flex items-center mt-2 py-1 text-sm leading-5 text-gray-500">
                    <span className="inline-flex items-center">
                      <span className="sr-only">Sell price per unit</span>
                      <CreditCardIcon className="mr-1 w-4 h-4 text-gray-900" />{' '}
                      {formatNumberCommas(goodToSell.sellPricePerUnit)}
                    </span>
                    <span className="ml-4 inline-flex items-center">
                      <span className="sr-only">Volume per unit</span>
                      <CubeIcon className="mr-1 w-4 h-4 text-gray-900" />{' '}
                      {formatNumberCommas(goodToSell.volumePerUnit)}
                    </span>
                  </div>
                  {shipOptions.length > 0 ? (
                    <>
                      <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-4">
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
                        <div className="sm:col-span-2">
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
                              max={goodToSell.quantityAvailable}
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              onChange={(e) => {
                                const quantity = !isNaN(
                                  parseInt(e.target.value)
                                )
                                  ? parseInt(e.target.value)
                                  : 0
                                setGoodToSell({
                                  ...goodToSell,
                                  quantity,
                                })
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="pt-6 sm:col-span-6">
                          <button
                            type="submit"
                            className={
                              'truncate inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' +
                              (goodToSell.quantity === 0 ||
                              !goodToSell.shipId ||
                              handleSellGood.isLoading
                                ? ' opacity-50 cursor-not-allowed'
                                : '')
                            }
                            disabled={
                              goodToSell.quantity === 0 ||
                              !goodToSell.shipId ||
                              handleSellGood.isLoading
                            }
                            onClick={(e) => {
                              e.preventDefault()
                              const ship = myShips.data?.ships.find(
                                (s) => s.id === goodToSell.shipId
                              )
                              if (!ship) {
                                throw new Error('Ship not found')
                              }
                              handleSellGood.mutate({
                                ship,
                                symbol: goodToSell.symbol,
                                quantity: goodToSell.quantity ?? 0,
                              })
                            }}
                          >
                            {!handleSellGood.isLoading ? (
                              `Sell ${
                                !!goodToSell.quantity && goodToSell.quantity > 0
                                  ? `${formatNumberCommas(
                                      goodToSell.quantity
                                    )} ${
                                      GoodType[
                                        goodToSell.symbol as unknown as keyof typeof GoodType
                                      ]
                                    }
                            for ${formatNumberCommas(
                              goodToSell.quantity *
                                goodToSell.purchasePricePerUnit
                            )} units`
                                  : ''
                              }`
                            ) : (
                              <>
                                Placing sell order
                                <div className="ml-2">
                                  <LoadingSpinner />
                                </div>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-center">
                      <div className="w-full py-4">
                        <div className="flex flex-col items-center text-center mb-4">
                          <h3 className="mt-2 text-sm font-medium text-gray-900">
                            No ships available to sell goods.
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Ships must be docked in this location to sell goods.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            )}
          </>
        }
        onClose={() => setGoodToSell(null)}
        className="w-full md:max-w-xl"
      />
      <Modal
        open={!!shipToBuy}
        title="Buy Ship"
        content={
          <>
            {shipToBuy && (
              <div className="mt-4 px-4 py-2">
                <form>
                  <div>
                    <h3 className="text-md font-medium text-gray-900">
                      Buy {shipToBuy.type}
                    </h3>
                  </div>
                  <div className="flex items-center mt-2 py-1 text-sm leading-5 text-gray-500">
                    <span className="inline-flex items-center">
                      <span className="sr-only">Manufacturer</span>
                      <OfficeBuildingIcon className="mr-1 w-4 h-4 text-gray-900" />{' '}
                      {shipToBuy.manufacturer}
                    </span>
                    <span className="ml-4 inline-flex items-center">
                      <span className="sr-only">Speed</span>
                      <LightningBoltIcon className="mr-1 w-4 h-4 text-gray-900" />{' '}
                      {shipToBuy.speed}
                    </span>
                    <span className="ml-4 inline-flex items-center">
                      <span className="sr-only">Weapons</span>
                      <FireIcon className="mr-1 w-4 h-4 text-gray-900" />{' '}
                      {shipToBuy.weapons}
                    </span>
                    <span className="ml-4 inline-flex items-center">
                      <span className="sr-only">Plating</span>
                      <HeartIcon className="mr-1 w-4 h-4 text-gray-900" />{' '}
                      {shipToBuy.plating}
                    </span>
                    <span className="ml-4 inline-flex items-center">
                      <span className="sr-only">Loading speed</span>
                      <TruckIcon className="mr-1 w-4 h-4 text-gray-900" />{' '}
                      {shipToBuy.loadingSpeed}
                    </span>
                    <span className="ml-4 inline-flex items-center">
                      <span className="sr-only">Max cargo</span>
                      <CubeIcon className="mr-1 w-4 h-4 text-gray-900" />{' '}
                      {shipToBuy.maxCargo}
                    </span>
                  </div>
                  {isFirstShip || shipOptions.length > 0 ? (
                    <div className="mt-4">
                      {shipToBuy.purchaseLocations
                        .filter((pl) =>
                          shipOptions.length > 0
                            ? myShips.data?.ships.find(
                                (s) => s.location === pl.location
                              )
                            : true
                        )
                        .map((pl) => (
                          <div
                            key={pl.location}
                            className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6"
                          >
                            <div className="sm:col-span-2">
                              <label
                                htmlFor="location"
                                className="block text-sm font-medium text-gray-700"
                              >
                                Location
                              </label>
                              <p
                                id="location"
                                className="text-sm font-medium text-gray-900"
                              >
                                {pl.location}
                              </p>
                            </div>
                            <div className="justify-self-end sm:col-span-4">
                              <button
                                type="submit"
                                className={
                                  'truncate inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' +
                                  (handleBuyShip.isLoading
                                    ? ' opacity-50 cursor-not-allowed'
                                    : '')
                                }
                                disabled={handleBuyShip.isLoading}
                                onClick={(e) => {
                                  e.preventDefault()
                                  const { type } = shipToBuy
                                  handleBuyShip.mutate({
                                    location: pl.location,
                                    type,
                                  })
                                }}
                              >
                                {!handleBuyShip.isLoading ? (
                                  `Buy ${
                                    shipToBuy.type
                                  } for ${formatNumberCommas(pl.price)} credits`
                                ) : (
                                  <>
                                    Purchasing
                                    <div className="ml-2">
                                      <LoadingSpinner />
                                    </div>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <div className="w-full py-4">
                        <div className="flex flex-col items-center text-center mb-4">
                          <h3 className="mt-2 text-sm font-medium text-gray-900">
                            No ships docked in a purchase location.
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            A ship must be docked in one of the purchase
                            locations in order to buy a new ship.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            )}
          </>
        }
        onClose={() => setShipToBuy(null)}
      />
    </>
  )
}
