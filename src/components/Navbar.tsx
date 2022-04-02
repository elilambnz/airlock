import { Disclosure, Menu, Transition } from '@headlessui/react'
import { CubeTransparentIcon } from '@heroicons/react/outline'
import { CreditCardIcon, MenuIcon, XIcon } from '@heroicons/react/solid'
import { Fragment, useState } from 'react'
import { useQuery } from 'react-query'
import { Link, useLocation } from 'react-router-dom'
import { getMyAgent } from '../api/routes/agents'
import { useAuth } from '../hooks/useAuth'

import { abbreviateNumber, formatNumberCommas } from '../utils/helpers'

const BUILD = process.env.REACT_APP_GIT_SHA

export default function Navbar() {
  const [showFullCredits, setShowFullCredits] = useState(false)

  const location = useLocation()
  const auth = useAuth()
  const agent = useQuery('agent', getMyAgent)

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
  }

  const links = [
    { path: '', name: 'Home' },
    { path: 'agent', name: 'Agent' },
  ]

  return (
    <Disclosure as="nav" className="bg-gray-800">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center truncate">
                <Link to="/" className="flex-shrink-0">
                  <CubeTransparentIcon className="h-8 w-8 text-white" />
                </Link>
                <div className="flex md:hidden">
                  <span className="ml-2 text-xl font-semibold tracking-tight text-white">
                    Airlock
                  </span>
                </div>
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    {links.map((link) => (
                      <Link
                        key={link.name}
                        to={link.path}
                        className={
                          link.path === location.pathname.split('/')[1]
                            ? 'rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white'
                            : 'rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:text-white'
                        }
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6">
                  <div
                    className="mr-2 flex items-center hover:cursor-pointer"
                    onClick={() => setShowFullCredits((prev) => !prev)}
                  >
                    <span className="rounded-full bg-gray-800 p-1 text-gray-400">
                      <span className="sr-only">Credits</span>
                      <CreditCardIcon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <span className="block px-1 py-2 text-sm text-gray-400">
                      {!showFullCredits
                        ? abbreviateNumber(agent.data?.data.credits ?? 0)
                        : formatNumberCommas(agent.data?.data.credits ?? 0)}
                    </span>
                  </div>
                  {/* Profile dropdown */}
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                        <span className="sr-only">Open user menu</span>
                        <span className="inline-block h-8 w-8 overflow-hidden rounded-full bg-gray-100 text-3xl">
                          🧑‍🚀
                        </span>
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="w-74 absolute right-0 z-10 mt-2 origin-top-right divide-y divide-gray-100 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                          <Menu.Item>
                            {() => (
                              <span className="block px-4 py-2 text-sm font-medium text-gray-700">
                                {agent.data?.data.symbol}
                              </span>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {() => (
                              <>
                                <span className="block px-4 py-1 text-xs font-medium text-gray-700">
                                  API Token
                                </span>
                                <div className="mx-3 mb-2">
                                  <div className="overflow-auto rounded-md bg-gray-50 px-2 py-2 text-xs">
                                    <pre>{auth.apiToken}</pre>
                                  </div>
                                </div>
                              </>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {() => (
                              <>
                                <span className="block px-4 py-1 text-xs font-medium text-gray-700">
                                  Build
                                </span>
                                <span className="block px-4 py-1 text-xs text-gray-700">
                                  <pre>{BUILD}</pre>
                                </span>
                              </>
                            )}
                          </Menu.Item>
                        </div>
                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block w-full px-4 py-2 text-left text-sm text-gray-700'
                                )}
                                onClick={() => auth.signout()}
                              >
                                Sign out
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
              <div className="-mr-2 flex md:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3">
              {links.map((link) => (
                <Disclosure.Button
                  key={link.name}
                  as={Link}
                  to={link.path}
                  className={
                    'block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white' +
                    (link.path === location.pathname
                      ? ' bg-gray-900 text-white'
                      : '')
                  }
                >
                  {link.name}
                </Disclosure.Button>
              ))}
            </div>
            <div className="divide-y divide-gray-700 border-t border-gray-700 pt-4 pb-3">
              <div className="py-1">
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <span className="inline-block h-8 w-8 overflow-hidden rounded-full bg-gray-100 text-3xl">
                      🧑‍🚀
                    </span>
                  </div>
                  <span className="block px-4 py-2 text-sm font-medium text-gray-400">
                    {agent.data?.data.symbol}
                  </span>
                  <div
                    className="flex items-center hover:cursor-pointer"
                    onClick={() => setShowFullCredits((prev) => !prev)}
                  >
                    <span className="rounded-full bg-gray-800 p-1 text-gray-400">
                      <span className="sr-only">Credits</span>
                      <CreditCardIcon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <span className="block px-1 py-2 text-sm text-gray-400">
                      {!showFullCredits
                        ? abbreviateNumber(agent.data?.data.credits ?? 0)
                        : formatNumberCommas(agent.data?.data.credits ?? 0)}
                    </span>
                  </div>
                </div>
                <div className="mb-2 space-y-1 p-2">
                  <span className="block px-4 py-1 text-sm text-gray-400">
                    API Token
                  </span>
                  <div className="mx-3 mb-2">
                    <div className="overflow-auto rounded-md bg-gray-50 px-2 py-2 text-xs">
                      <pre>{auth.apiToken}</pre>
                    </div>
                  </div>
                </div>
                <div className="mb-2 space-y-1 p-2">
                  <span className="block px-4 py-1 text-sm text-gray-400">
                    Build
                  </span>
                  <span className="block px-4 py-1 text-sm text-gray-400">
                    <pre>{BUILD}</pre>
                  </span>
                </div>
              </div>
              <div className="py-1">
                <div className="space-y-1 px-2 pt-2 sm:px-3">
                  <button
                    className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                    onClick={() => auth.signout()}
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}
