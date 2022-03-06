import { Fragment, useEffect, useMemo, useState } from 'react'
import { Combobox, Dialog, Transition } from '@headlessui/react'
import { SearchIcon } from '@heroicons/react/solid'
import {
  ExclamationIcon,
  GlobeIcon,
  PaperAirplaneIcon,
  SupportIcon,
} from '@heroicons/react/outline'
import { useQueries, useQuery } from 'react-query'
import { listMyShips } from '../api/routes/my'
import { System, Location } from '../types/Location'
import { getSystemLocations } from '../api/routes/systems'
import { getShipName } from '../utils/helpers'
import { useNavigate } from 'react-router-dom'
import { Ship } from '../types/Ship'

function classNames(...classes: (string | Boolean)[]) {
  return classes.filter(Boolean).join(' ')
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [rawQuery, setRawQuery] = useState('')

  const myShips = useQuery('myShips', listMyShips)

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

  const availableSystems = useQueries(
    knownSystems.map((systemSymbol) => ({
      queryKey: ['systemLocations', systemSymbol],
      queryFn: () => getSystemLocations(systemSymbol),
    })) ?? []
  )

  const navigate = useNavigate()

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const query = rawQuery.toLowerCase().replace(/^[#@]/, '')

  const availableShips =
    myShips.data?.ships
      .sort(
        (a, b) =>
          a.type.localeCompare(b.type) ||
          getShipName(a.id).localeCompare(getShipName(b.id))
      )
      .map((s) => ({ ...s!, url: `/account/${s.id}` })) ?? []

  const filteredShips =
    rawQuery === '#'
      ? availableShips
      : query === '' || rawQuery.startsWith('@')
      ? []
      : availableShips.filter(
          (s) =>
            getShipName(s.id).toLowerCase().includes(query) ||
            s.location?.toLowerCase().includes(query)
        )

  const availableLocations = availableSystems
    .flatMap((s) => s.data?.locations)
    .filter(Boolean)
    ?.map((l) => ({ ...l!, url: `/systems/${l?.symbol.split('-')[0]}` }))

  const filteredLocations =
    rawQuery === '@'
      ? availableLocations
      : query === '' || rawQuery.startsWith('#')
      ? []
      : availableLocations.filter(
          (l) =>
            l!.name.toLowerCase().includes(query) ||
            l!.symbol.toLowerCase().includes(query)
        )

  return (
    <Transition.Root
      show={open}
      as={Fragment}
      afterLeave={() => setRawQuery('')}
    >
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20"
        onClose={setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
        </Transition.Child>

        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Combobox
            as="div"
            className="mx-auto max-w-xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all"
            value={null}
            onChange={(value: (Ship | Location) & { url: string }) => {
              setOpen(false)
              setTimeout(() => {
                navigate(value.url)
              }, 500)
            }}
          >
            <div className="relative">
              <SearchIcon
                className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
              <Combobox.Input
                className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-800 placeholder-gray-400 focus:ring-0 sm:text-sm"
                placeholder="Search..."
                onChange={(event) => setRawQuery(event.target.value)}
              />
            </div>

            {(filteredShips.length > 0 || filteredLocations.length > 0) && (
              <Combobox.Options
                static
                className="max-h-80 scroll-py-10 scroll-pb-2 space-y-4 overflow-y-auto p-4 pb-2"
              >
                {filteredShips.length > 0 && (
                  <li>
                    <h2 className="text-xs font-semibold text-gray-900">
                      Ships
                    </h2>
                    <ul className="-mx-4 mt-2 text-sm text-gray-700">
                      {filteredShips.map((ship) => (
                        <Combobox.Option
                          key={ship.id}
                          value={ship}
                          className={({ active }) =>
                            classNames(
                              'flex cursor-default select-none items-center px-4 py-2',
                              active && 'bg-indigo-600 text-white'
                            )
                          }
                        >
                          {({ active }) => (
                            <>
                              <PaperAirplaneIcon
                                className={classNames(
                                  'h-6 w-6 flex-none',
                                  active ? 'text-white' : 'text-gray-400'
                                )}
                                aria-hidden="true"
                              />
                              <span className="ml-3 flex-auto truncate">
                                {getShipName(ship.id)}
                              </span>
                              <div className="inline-flex text-xs text-gray-500">
                                <span className="ml-1 px-2 inline-flex text-xs leading-5 rounded-full bg-gray-100">
                                  {ship.type}
                                </span>
                                <span className="ml-1 px-2 inline-flex text-xs leading-5 rounded-full bg-gray-100">
                                  {ship.location}
                                </span>
                              </div>
                            </>
                          )}
                        </Combobox.Option>
                      ))}
                    </ul>
                  </li>
                )}
                {filteredLocations.length > 0 && (
                  <li>
                    <h2 className="text-xs font-semibold text-gray-900">
                      Locations
                    </h2>
                    <ul className="-mx-4 mt-2 text-sm text-gray-700">
                      {filteredLocations.map((location) => (
                        <Combobox.Option
                          key={location!.symbol}
                          value={location}
                          className={({ active }) =>
                            classNames(
                              'flex cursor-default select-none items-center px-4 py-2',
                              active && 'bg-indigo-600 text-white'
                            )
                          }
                        >
                          {({ active }) => (
                            <>
                              <GlobeIcon
                                className={classNames(
                                  'h-6 w-6 flex-none',
                                  active ? 'text-white' : 'text-gray-400'
                                )}
                                aria-hidden="true"
                              />
                              <span className="ml-3 flex-auto truncate">
                                {location!.symbol.split('-')[0]} /{' '}
                                {location!.name}
                              </span>
                            </>
                          )}
                        </Combobox.Option>
                      ))}
                    </ul>
                  </li>
                )}
              </Combobox.Options>
            )}

            {rawQuery === '?' && (
              <div className="py-14 px-6 text-center text-sm sm:px-14">
                <SupportIcon
                  className="mx-auto h-6 w-6 text-gray-400"
                  aria-hidden="true"
                />
                <p className="mt-4 font-semibold text-gray-900">
                  Help with searching
                </p>
                <p className="mt-2 text-gray-500">
                  Use this tool to quickly search for ships and locations across
                  all systems. You can also use the search modifiers found in
                  the footer below to limit the results to just ships or
                  locations.
                </p>
              </div>
            )}

            {query !== '' &&
              rawQuery !== '?' &&
              filteredShips.length === 0 &&
              filteredLocations.length === 0 && (
                <div className="py-14 px-6 text-center text-sm sm:px-14">
                  <ExclamationIcon
                    className="mx-auto h-6 w-6 text-gray-400"
                    aria-hidden="true"
                  />
                  <p className="mt-4 font-semibold text-gray-900">
                    No results found
                  </p>
                  <p className="mt-2 text-gray-500">
                    We couldn't find anything with that term. Please try again.
                  </p>
                </div>
              )}

            <div className="flex flex-wrap items-center bg-gray-50 py-2.5 px-4 text-xs text-gray-700">
              Type{' '}
              <kbd
                className={classNames(
                  'mx-1 flex h-5 w-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2',
                  rawQuery.startsWith('#')
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-gray-400 text-gray-900'
                )}
              >
                #
              </kbd>{' '}
              <span className="sm:hidden">for ships,</span>
              <span className="hidden sm:inline">to view ships,</span>
              <kbd
                className={classNames(
                  'mx-1 flex h-5 w-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2',
                  rawQuery.startsWith('@')
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-gray-400 text-gray-900'
                )}
              >
                @
              </kbd>{' '}
              for locations, and{' '}
              <kbd
                className={classNames(
                  'mx-1 flex h-5 w-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2',
                  rawQuery === '?'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-gray-400 text-gray-900'
                )}
              >
                ?
              </kbd>{' '}
              for help.
            </div>
          </Combobox>
        </Transition.Child>
      </Dialog>
    </Transition.Root>
  )
}
