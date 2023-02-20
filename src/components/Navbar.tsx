import { Disclosure, Menu, Transition } from '@headlessui/react'
import { CubeTransparentIcon } from '@heroicons/react/outline'
import { CreditCardIcon, MenuIcon, XIcon } from '@heroicons/react/solid'
import { Fragment, useState } from 'react'
import { useQuery } from 'react-query'
import { Link, useLocation } from 'react-router-dom'
import { getMyAccount } from '../api/routes/my'
import { useAuth } from '../hooks/useAuth'

import { abbreviateNumber, formatNumberCommas } from '../utils/helpers'

const BUILD = process.env.REACT_APP_GIT_SHA

export default function Navbar() {
  const [showFullCredits, setShowFullCredits] = useState(false)

  const location = useLocation()
  const auth = useAuth()
  const user = useQuery('user', getMyAccount)

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
  }

  const links = [
    { path: '', name: 'Home' },
    { path: 'account', name: 'Account' },
    { path: 'systems', name: 'Systems' },
    { path: 'marketplace', name: 'Marketplace' },
    { path: 'structures', name: 'Structures' },
    // { path: 'automation', name: 'Automation' },
    { path: 'loans', name: 'Loans' },
  ]

  return (
    <Disclosure as="nav" className="bg-gray-800">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center truncate">
                <Link to="/" className="flex-shrink-0">
                  <CubeTransparentIcon className="h-8 w-8 text-white" />
                </Link>
                <div className="flex md:hidden">
                  <span className="ml-2 text-white font-semibold text-xl tracking-tight">
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
                            ? 'bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium'
                            : 'text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium'
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
                    className="flex items-center hover:cursor-pointer mr-2"
                    onClick={() => setShowFullCredits((prev) => !prev)}
                  >
                    <span className="bg-gray-800 p-1 rounded-full text-gray-400">
                      <span className="sr-only">Credits</span>
                      <CreditCardIcon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <span className="block px-1 py-2 text-sm text-gray-400">
                      {!showFullCredits
                        ? abbreviateNumber(user.data?.user.credits ?? 0)
                        : formatNumberCommas(user.data?.user.credits ?? 0)}
                    </span>
                  </div>
                  {/* Profile dropdown */}
                  <Menu as="div" className="ml-3 relative">
                    <div>
                      <Menu.Button className="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                        <span className="sr-only">Open user menu</span>
                        <span className="text-3xl inline-block h-8 w-8 rounded-full overflow-hidden bg-gray-100">
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
                      <Menu.Items className="z-10 origin-top-right absolute right-0 mt-2 w-74 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none">
                        <div className="py-1">
                          <Menu.Item>
                            {() => (
                              <span className="block px-4 py-2 text-sm text-gray-700 font-medium">
                                {user.data?.user.username}
                              </span>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {() => (
                              <>
                                <span className="block px-4 py-1 text-xs text-gray-700 font-medium">
                                  API Token
                                </span>
                                <div className="mx-3 mb-2">
                                  <div className="rounded-md text-xs bg-gray-50 px-2 py-2 overflow-auto">
                                    <pre>{auth.apiToken}</pre>
                                  </div>
                                </div>
                              </>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {() => (
                              <>
                                <span className="block px-4 py-1 text-xs text-gray-700 font-medium">
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
                                  'block w-full text-left px-4 py-2 text-sm text-gray-700'
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
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
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
            <div className="px-2 pt-2 pb-3 space-y-1">
              {links.map((link) => (
                <Disclosure.Button
                  key={link.name}
                  as={Link}
                  to={link.path}
                  className={
                    'block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white' +
                    (link.path === location.pathname
                      ? ' bg-gray-900 text-white'
                      : '')
                  }
                >
                  {link.name}
                </Disclosure.Button>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-700 divide-y divide-gray-700">
              <div className="py-1">
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <span className="text-3xl inline-block h-8 w-8 rounded-full overflow-hidden bg-gray-100">
                      🧑‍🚀
                    </span>
                  </div>
                  <span className="block px-4 py-2 text-sm text-gray-400 font-medium">
                    {user.data?.user.username}
                  </span>
                  <div
                    className="flex items-center hover:cursor-pointer"
                    onClick={() => setShowFullCredits((prev) => !prev)}
                  >
                    <span className="bg-gray-800 p-1 rounded-full text-gray-400">
                      <span className="sr-only">Credits</span>
                      <CreditCardIcon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <span className="block px-1 py-2 text-sm text-gray-400">
                      {!showFullCredits
                        ? abbreviateNumber(user.data?.user.credits ?? 0)
                        : formatNumberCommas(user.data?.user.credits ?? 0)}
                    </span>
                  </div>
                </div>
                <div className="p-2 mb-2 space-y-1">
                  <span className="block px-4 py-1 text-sm text-gray-400">
                    API Token
                  </span>
                  <div className="mx-3 mb-2">
                    <div className="rounded-md text-xs bg-gray-50 px-2 py-2 overflow-auto">
                      <pre>{auth.apiToken}</pre>
                    </div>
                  </div>
                </div>
                <div className="p-2 mb-2 space-y-1">
                  <span className="block px-4 py-1 text-sm text-gray-400">
                    Build
                  </span>
                  <span className="block px-4 py-1 text-sm text-gray-400">
                    <pre>{BUILD}</pre>
                  </span>
                </div>
              </div>
              <div className="py-1">
                <div className="px-2 pt-2 space-y-1 sm:px-3">
                  <button
                    className="w-full text-left text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
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
