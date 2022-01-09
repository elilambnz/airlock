import React, { useState, useEffect } from 'react'
import { getGameStatus, getLeaderboardNetWorth } from '../../api/routes/game'
import '../../App.css'
import { StatusResponse, LeaderboardNetWorthResponse } from '../../types/Game'
import { capitaliseFirstLetter } from '../../utils/helpers'

function Home() {
  const [gameStatus, setGameStatus] = useState<StatusResponse['status']>()
  const [leaderboard, setLeaderboard] = useState<LeaderboardNetWorthResponse>()

  useEffect(() => {
    const init = async () => {
      setGameStatus(await getGameStatus())
      setLeaderboard(await getLeaderboardNetWorth())
    }
    init()
  }, [])

  const renderLoadingRows = () => {
    return Array(11)
      .fill(0)
      .map((_, i) => (
        <tr key={i}>
          <td className="px-6 py-4 whitespace-nowrap animate-pulse">
            <div className="w-full bg-gray-300 h-5 rounded-md"></div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap animate-pulse">
            <div className="w-full bg-gray-300 h-5 rounded-md"></div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap animate-pulse">
            <div className="w-full bg-gray-300 h-5 rounded-md"></div>
          </td>
        </tr>
      ))
  }

  return (
    <>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Airlock</h1>
        </div>
      </header>
      <main>
        <div className="bg-gray-100 min-h-screen">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
                Status
              </h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                {gameStatus ? capitaliseFirstLetter(gameStatus) : 'Loading...'}
              </p>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg my-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Leaderboard
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Net worth
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
                              Rank
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Username
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Net Worth
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {leaderboard
                            ? [
                                ...leaderboard.netWorth,
                                ...[leaderboard.userNetWorth],
                              ]
                                .sort((a, b) => a.rank - b.rank)
                                .map((netWorth, i) => (
                                  <tr key={i}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div
                                        className={
                                          'text-sm text-gray-900' +
                                          (netWorth.username ===
                                          process.env.REACT_APP_USERNAME
                                            ? ' font-bold'
                                            : 'font-medium')
                                        }
                                      >
                                        {netWorth.rank}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div
                                        className={
                                          'text-sm text-gray-900' +
                                          (netWorth.username ===
                                          process.env.REACT_APP_USERNAME
                                            ? ' font-bold'
                                            : 'font-medium')
                                        }
                                      >
                                        {netWorth.username}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div
                                        className={
                                          'text-sm text-gray-900' +
                                          (netWorth.username ===
                                          process.env.REACT_APP_USERNAME
                                            ? ' font-bold'
                                            : 'font-medium')
                                        }
                                      >
                                        {netWorth.netWorth}
                                      </div>
                                    </td>
                                  </tr>
                                ))
                            : renderLoadingRows()}
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
    </>
  )
}

export default Home
