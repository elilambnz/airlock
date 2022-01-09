import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getMyAccount } from '../api/routes/my'

import { User } from '../types/Account'

import { formatThousands } from '../utils/helpers'

const Navbar = () => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<User>()

  useEffect(() => {
    const init = async () => {
      const account = await getMyAccount()
      setUser(account?.user)
    }
    init()
  }, [])

  const links = [
    { path: '/', name: 'Home' },
    { path: '/account', name: 'Account' },
    { path: '/marketplace', name: 'Marketplace' },
    { path: '/systems', name: 'Systems' },
    { path: '/structures', name: 'Structures' },
    { path: '/loans', name: 'Loans' },
  ]

  const location = useLocation()

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#FFF"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
                />
              </svg>
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
                      link.path === location.pathname
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
              <span className="bg-gray-800 p-1 rounded-full text-gray-400">
                <span className="sr-only">Credits</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </span>
              <span className="block pl-1 pr-4 py-2 text-sm text-gray-400">
                {formatThousands(user?.credits ?? 0)}
              </span>

              {/* Profile dropdown */}
              <div className="ml-3 relative">
                <div>
                  <button
                    type="button"
                    className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                    id="user-menu-button"
                    aria-haspopup="true"
                    onClick={() => setShowProfileDropdown((prev) => !prev)}
                  >
                    <span className="sr-only">Open user menu</span>
                    <span className="inline-block h-8 w-8 rounded-full overflow-hidden bg-gray-100">
                      <svg
                        className="h-full w-full text-gray-300"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"></path>
                      </svg>
                    </span>
                  </button>
                </div>

                {/* 
                Dropdown menu, show/hide based on menu state.

                Entering: "transition ease-out duration-100"
                  From: "transform opacity-0 scale-95"
                  To: "transform opacity-100 scale-100"
                Leaving: "transition ease-in duration-75"
                  From: "transform opacity-100 scale-100"
                  To: "transform opacity-0 scale-95"
                */}
                {showProfileDropdown && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-74 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                  >
                    {/* Active: "bg-gray-100", Not Active: " */}
                    <a
                      className="block px-4 py-2 text-sm text-gray-700"
                      role="menuitem"
                      id="user-menu-item-0"
                    >
                      API Token
                    </a>
                    <div className="mx-3 mb-2">
                      <div className="rounded-md text-xs bg-gray-50 px-2 py-2 overflow-auto">
                        <pre>{process.env.REACT_APP_TOKEN}</pre>
                      </div>
                    </div>
                    <hr />
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700"
                      role="menuitem"
                      id="user-menu-item-1"
                    >
                      Sign out
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            {/* Mobile menu button */}
            <button
              type="button"
              className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              aria-controls="mobile-menu"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={'h-6 w-6' + (mobileMenuOpen ? ' hidden' : ' block')}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={' h-6 w-6' + (mobileMenuOpen ? ' block' : ' hidden')}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state. */}
      {mobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={
                  location.pathname === link.path
                    ? 'bg-gray-900 text-white block px-3 py-2 rounded-md text-base font-medium'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium'
                }
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-700">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <img
                  className="h-10 w-10 rounded-full"
                  src="https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
                  alt=""
                />
              </div>
              <div className="inline-flex ml-3">
                <span className="bg-gray-800 p-1 rounded-full text-gray-400">
                  <span className="sr-only">Credits</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </span>
                <span className="block pl-1 pr-4 py-2 text-sm text-gray-400">
                  {formatThousands(user?.credits ?? 0)}
                </span>
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-400">
                API Token
              </a>
              <div className="mx-3">
                <div className="rounded-md text-xs bg-gray-50 px-2 py-2 overflow-auto">
                  <pre>{process.env.REACT_APP_TOKEN}</pre>
                </div>
              </div>
              <a
                href="#"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
              >
                Sign out
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
