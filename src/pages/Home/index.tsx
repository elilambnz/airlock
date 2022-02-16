import { useQuery } from 'react-query'
import { getGameStatus, getLeaderboardNetWorth } from '../../api/routes/game'
import { getMyAccount } from '../../api/routes/my'
import '../../App.css'
import LoadingRows from '../../components/Table/LoadingRows'
import { NetWorth } from '../../types/Game'
import {
  abbreviateNumber,
  capitaliseFirstLetter,
  formatNumberCommas,
} from '../../utils/helpers'

export default function Home() {
  const gameStatus = useQuery('gameStatus', getGameStatus)
  const leaderboardNetWorth = useQuery(
    'leaderboardNetWorth',
    getLeaderboardNetWorth
  )
  const user = useQuery('user', getMyAccount)

  const combinedLeaderboard = (leaderboardNetWorth.data &&
    [
      ...leaderboardNetWorth.data.netWorth,
      ...[leaderboardNetWorth.data.userNetWorth],
    ]
      .filter((u) => !!u)
      ?.sort((a, b) => a!.rank - b!.rank)) as NetWorth[]

  return (
    <>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Airlock{' '}
            <span className="ml-2 text-sm text-gray-600">
              SpaceTraders Web Client
            </span>
          </h1>
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
            <div className="lg:text-center">
              <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
                Status
              </h2>
              {!gameStatus.isLoading ? (
                <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                  {capitaliseFirstLetter(gameStatus.data?.status ?? '')}
                </p>
              ) : (
                <div className="flex justify-center animate-pulse">
                  <div className="mt-2 w-72 bg-gray-300 h-10 rounded-md"></div>
                </div>
              )}
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg my-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Net Worth Leaderboard
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  How do you stack up against your fellow traders?
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
                          {!leaderboardNetWorth.isLoading && !user.isLoading ? (
                            combinedLeaderboard.map((leaderboardUser, i) => (
                              <tr
                                key={i}
                                className={
                                  i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                }
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 font-medium text-gray-900">
                                  <div
                                    className={
                                      'text-sm text-gray-900' +
                                      (leaderboardUser.username ===
                                      user.data?.user.username
                                        ? ' font-bold'
                                        : 'font-medium')
                                    }
                                  >
                                    {formatNumberCommas(leaderboardUser.rank)}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                  <div
                                    className={
                                      'text-sm text-gray-900' +
                                      (leaderboardUser.username ===
                                      user.data?.user.username
                                        ? ' font-bold'
                                        : 'font-medium')
                                    }
                                  >
                                    {leaderboardUser.username}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                  <div
                                    className={
                                      'text-sm text-gray-900' +
                                      (leaderboardUser.username ===
                                      user.data?.user.username
                                        ? ' font-bold'
                                        : 'font-medium')
                                    }
                                  >
                                    {abbreviateNumber(leaderboardUser.netWorth)}
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <LoadingRows cols={3} rows={11} />
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
    </>
  )
}
