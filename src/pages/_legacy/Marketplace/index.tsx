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
  formatNumberCommas,
  getErrorMessage,
  getShipName,
} from '../../utils/helpers'
import { purchase, sell } from '../../utils/mechanics'
import moment from 'moment'
import {
  CreditCardIcon,
  CubeIcon,
  ExclamationIcon,
  GlobeIcon,
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
import Header from '../../components/Header'
import Main from '../../components/Main'
import Section from '../../components/Section'
import Title from '../../components/Title'

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
          ?.sort((a, b) => {
            return (
              Object.keys(System).indexOf(a?.split('-')[0] || '') -
                Object.keys(System).indexOf(b?.split('-')[0] || '') ||
              a!.localeCompare(b!)
            )
          }) as string[]
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

  const goodTypes = useQuery('goodTypes', listGoodTypes, {
    staleTime: Infinity,
  })

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
          message: `${quantity} ${
            GoodType[symbol as unknown as keyof typeof GoodType]
          } added to ${getShipName(ship.id)}`,
          type: NotificationType.SUCCESS,
        })
      },
      onError: (error: any) => {
        push({
          title: 'Error',
          message: getErrorMessage(error),
          type: NotificationType.ERROR,
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
          message: `${quantity} ${
            GoodType[symbol as unknown as keyof typeof GoodType]
          } sold from ${getShipName(ship.id)}`,
          type: NotificationType.SUCCESS,
        })
      },
      onError: (error: any) => {
        push({
          title: 'Error',
          message: getErrorMessage(error),
          type: NotificationType.ERROR,
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
          type: NotificationType.SUCCESS,
        })
      },
      onError: (error: any) => {
        push({
          title: 'Error',
          message: getErrorMessage(error),
          type: NotificationType.ERROR,
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

  const marketplaceResults = marketplace.filter((m) =>
    !m.isLoading && filteredGood
      ? (m.data?.marketplace.filter((g) =>
          filteredGood ? g.symbol === filteredGood : true
        ).length ?? 0) > 0
      : true
  )

  const goodToBuyShip = myShips.data?.ships.find(
    (s) => s.id === goodToBuy?.shipId
  )

  const goodToBuyError =
    goodToBuy &&
    goodToBuyShip &&
    (goodToBuy.quantity ?? 0) >
      Math.min(goodToBuy.quantityAvailable, goodToBuyShip.spaceAvailable)

  const goodToSellShip = myShips.data?.ships.find(
    (s) => s.id === goodToSell?.shipId
  )

  const goodToSellError =
    goodToSell &&
    goodToSellShip &&
    (goodToSell.quantity ?? 0) >
      (goodToSellShip.cargo.find((c) => c.good === goodToSell.symbol)
        ?.quantity ?? 0)

  return (
    <>
      <Header>Marketplace</Header>
      <Main>
        <Title>Goods</Title>

        <Section>
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Trade Goods
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Generate profit by trading goods or buying resources for your
              structures.
            </p>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 py-4 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <Select
                  label="Filter by Good"
                  options={
                    goodTypes.data?.goods
                      .sort((a, b) =>
                        GoodType[
                          a.symbol as unknown as keyof typeof GoodType
                        ].localeCompare(
                          GoodType[b.symbol as unknown as keyof typeof GoodType]
                        )
                      )
                      .map((g) => ({
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
                  <div className="mt-2 flex items-center py-1 text-sm leading-5 text-gray-500">
                    <span className="inline-flex items-center">
                      <span className="sr-only">Trade</span>
                      <TrendingUpIcon className="mr-1 h-4 w-4 text-gray-900" />{' '}
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
                        className="mx-1 block h-6 w-12 border-0 border-b border-transparent bg-gray-50 px-1 text-sm focus:border-indigo-600 focus:ring-0"
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
                    <CubeIcon className="ml-4 mr-1 h-4 w-4 text-gray-900" />{' '}
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
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg"></div>
                {myShips.isLoading || marketplace.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                          Symbol
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                          Quantity Available
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                          Volume/Unit
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                          Purchase Price/Unit
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                          Sell Price/Unit
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {myShips.isLoading && <LoadingRows cols={6} rows={3} />}
                      {myShips.isLoading || marketplaceResults.length > 0 ? (
                        marketplaceResults.map((m, i) => (
                          <>
                            <tr
                              key={dockedLocations[i]}
                              className="bg-gray-100"
                            >
                              <td
                                className="whitespace-nowrap px-6 py-2 text-sm leading-5 text-gray-500"
                                colSpan={9}
                              >
                                <div className="flex items-baseline justify-between">
                                  <span>{dockedLocations[i]}</span>
                                  <span className="text-xs">
                                    {m.dataUpdatedAt > 0 && (
                                      <>
                                        Last updated:{' '}
                                        {moment(m.dataUpdatedAt).format(
                                          'DD/MM/YY hh:mm:ss a'
                                        )}
                                      </>
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
                                  .sort((a, b) =>
                                    a.symbol.localeCompare(b.symbol)
                                  )
                                  .map((locationMarketplace, j) => (
                                    <tr
                                      key={`${dockedLocations[i]}-${locationMarketplace.symbol}`}
                                      className={
                                        j % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                      }
                                    >
                                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium leading-5 text-gray-900">
                                        {
                                          GoodType[
                                            locationMarketplace.symbol as unknown as keyof typeof GoodType
                                          ]
                                        }
                                      </td>
                                      <td className="whitespace-nowrap px-6 py-4 text-sm leading-5 text-gray-500">
                                        {formatNumberCommas(
                                          locationMarketplace.quantityAvailable
                                        )}
                                      </td>
                                      <td className="whitespace-nowrap px-6 py-4 text-sm leading-5 text-gray-500">
                                        {formatNumberCommas(
                                          locationMarketplace.volumePerUnit
                                        )}
                                      </td>
                                      <td
                                        className={
                                          'whitespace-nowrap px-6 py-4 text-sm leading-5 text-gray-500' +
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
                                        {formatNumberCommas(
                                          locationMarketplace.purchasePricePerUnit
                                        )}
                                      </td>
                                      <td
                                        className={
                                          'whitespace-nowrap px-6 py-4 text-sm leading-5 text-gray-500' +
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
                                        {formatNumberCommas(
                                          locationMarketplace.sellPricePerUnit
                                        )}
                                      </td>
                                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
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
                                <LoadingRows cols={6} rows={3} />
                              )}
                            </>
                          </>
                        ))
                      ) : (
                        <tr>
                          <td className="px-6 py-2" colSpan={6}>
                            <div className="w-full py-8 px-4">
                              <div className="mb-4 flex flex-col items-center text-center">
                                <ExclamationIcon className="h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">
                                  No locations have this good available!
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                  Try filtering by another good.
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex justify-center">
                    <div className="w-full py-8 px-4">
                      <div className="mb-4 flex flex-col items-center text-center">
                        <ShoppingBagIcon className="h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          No markets available!
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          You must have at least one ship docked at a location
                          to buy or sell goods.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Section>

        <Title>Ships</Title>

        <Section>
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Buy Ships
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Increase your fleet size by buying new ships.
            </p>
          </div>
          <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
                  {availableShips.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            Type
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            Class
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            Manufacturer
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            Purchase Location
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            Restricted Goods
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            Loading Speed
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            Max Cargo
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            Speed
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            Price
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {availableShips.map((listings, i) => (
                          <>
                            <tr key={knownSystems[i]} className="bg-gray-100">
                              <td
                                className="whitespace-nowrap px-6 py-2 text-sm leading-5 text-gray-500"
                                colSpan={10}
                              >
                                <div className="flex items-baseline justify-between">
                                  <span>{knownSystems[i]}</span>
                                  <span className="text-xs">
                                    {listings.dataUpdatedAt > 0 && (
                                      <>
                                        Last updated:{' '}
                                        {moment(listings.dataUpdatedAt).format(
                                          'DD/MM/YY hh:mm:ss a'
                                        )}
                                      </>
                                    )}
                                  </span>
                                </div>
                              </td>
                            </tr>
                            {!listings.isLoading ? (
                              listings.data?.shipListings
                                ?.sort((a, b) => a.type.localeCompare(b.type))
                                .map((ship, j) => (
                                  <tr
                                    key={ship.type}
                                    className={
                                      j % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                    }
                                  >
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium leading-5 text-gray-900">
                                      {ship.type}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm leading-5 text-gray-500">
                                      {ship.class}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm leading-5 text-gray-500">
                                      {ship.manufacturer}
                                    </td>
                                    <td className="px-6 py-4 text-sm leading-5 text-gray-500">
                                      {ship.purchaseLocations
                                        .map((pl) => pl.location)
                                        .join(', ')}
                                    </td>
                                    <td
                                      className={
                                        'whitespace-nowrap px-6 py-4 text-sm leading-5 text-gray-500' +
                                        (ship.restrictedGoods
                                          ? ' text-red-500'
                                          : '')
                                      }
                                    >
                                      {ship.restrictedGoods
                                        ?.map(
                                          (good) =>
                                            GoodType[
                                              good as unknown as keyof typeof GoodType
                                            ]
                                        )
                                        .join(', ') ?? 'None'}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm leading-5 text-gray-500">
                                      {formatNumberCommas(ship.loadingSpeed)}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm leading-5 text-gray-500">
                                      {formatNumberCommas(ship.maxCargo)}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm leading-5 text-gray-500">
                                      {formatNumberCommas(ship.speed)}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm leading-5 text-gray-500">
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
                                            .map((p) => formatNumberCommas(p))
                                            .join(' - ')
                                        : formatNumberCommas(
                                            ship.purchaseLocations[0].price
                                          )}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
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
                        <div className="rounded-lg bg-white py-8 px-4 shadow">
                          <div className="mb-4 text-center">
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
        </Section>
      </Main>
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
                      Buy{' '}
                      {
                        GoodType[
                          goodToBuy.symbol as unknown as keyof typeof GoodType
                        ]
                      }
                    </h3>
                  </div>
                  <div className="mt-2 flex items-center py-1 text-sm leading-5 text-gray-500">
                    <span className="inline-flex items-center">
                      <span className="sr-only">Location</span>
                      <GlobeIcon className="mr-1 h-4 w-4 text-gray-900" />{' '}
                      {goodToBuy.location}
                    </span>
                    <span className="ml-4 inline-flex items-center">
                      <span className="sr-only">Purchase price per unit</span>
                      <CreditCardIcon className="mr-1 h-4 w-4 text-gray-900" />{' '}
                      {formatNumberCommas(goodToBuy.purchasePricePerUnit)}
                    </span>
                    <span className="ml-4 inline-flex items-center">
                      <span className="sr-only">Volume per unit</span>
                      <CubeIcon className="mr-1 h-4 w-4 text-gray-900" />{' '}
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
                              max={goodToBuyShip?.spaceAvailable ?? 0}
                              className={
                                'block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm' +
                                (goodToBuyError
                                  ? ' border-red-500 focus:border-red-500 focus:ring-red-500'
                                  : '')
                              }
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
                              'inline-flex items-center justify-center truncate rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2' +
                              (goodToBuy.quantity === 0 ||
                              !goodToBuy.shipId ||
                              handleBuyGood.isLoading
                                ? ' cursor-not-allowed opacity-50'
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
                            )} credits`
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
                        <div className="mb-4 flex flex-col items-center text-center">
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
                      Sell{' '}
                      {
                        GoodType[
                          goodToSell.symbol as unknown as keyof typeof GoodType
                        ]
                      }
                    </h3>
                  </div>
                  <div className="mt-2 flex items-center py-1 text-sm leading-5 text-gray-500">
                    <span className="inline-flex items-center">
                      <span className="sr-only">Sell price per unit</span>
                      <CreditCardIcon className="mr-1 h-4 w-4 text-gray-900" />{' '}
                      {formatNumberCommas(goodToSell.sellPricePerUnit)}
                    </span>
                    <span className="ml-4 inline-flex items-center">
                      <span className="sr-only">Volume per unit</span>
                      <CubeIcon className="mr-1 h-4 w-4 text-gray-900" />{' '}
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
                              max={
                                goodToSellShip?.cargo.find(
                                  (c) => c.good === goodToSell.symbol
                                )?.quantity ?? 0
                              }
                              className={
                                'block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm' +
                                (goodToSellError
                                  ? ' border-red-500 focus:border-red-500 focus:ring-red-500'
                                  : '')
                              }
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
                              'inline-flex items-center justify-center truncate rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2' +
                              (goodToSell.quantity === 0 ||
                              !goodToSell.shipId ||
                              handleSellGood.isLoading
                                ? ' cursor-not-allowed opacity-50'
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
                            )} credits`
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
                        <div className="mb-4 flex flex-col items-center text-center">
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
                  <div className="mt-2 flex items-center py-1 text-sm leading-5 text-gray-500">
                    <span className="inline-flex items-center">
                      <span className="sr-only">Manufacturer</span>
                      <OfficeBuildingIcon className="mr-1 h-4 w-4 text-gray-900" />{' '}
                      {shipToBuy.manufacturer}
                    </span>
                    <span className="ml-4 inline-flex items-center">
                      <span className="sr-only">Loading speed</span>
                      <TruckIcon className="mr-1 h-4 w-4 text-gray-900" />{' '}
                      {shipToBuy.loadingSpeed}
                    </span>
                    <span className="ml-4 inline-flex items-center">
                      <span className="sr-only">Max cargo</span>
                      <CubeIcon className="mr-1 h-4 w-4 text-gray-900" />{' '}
                      {shipToBuy.maxCargo}
                    </span>
                    <span className="ml-4 inline-flex items-center">
                      <span className="sr-only">Speed</span>
                      <LightningBoltIcon className="mr-1 h-4 w-4 text-gray-900" />{' '}
                      {shipToBuy.speed}
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
                                  'inline-flex items-center justify-center truncate rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2' +
                                  (handleBuyShip.isLoading
                                    ? ' cursor-not-allowed opacity-50'
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
                        <div className="mb-4 flex flex-col items-center text-center">
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
