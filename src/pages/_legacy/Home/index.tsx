import { useQuery } from 'react-query'
import { getGameStatus, getLeaderboardNetWorth } from '../../../api/routes/game'
import { getMyAccount } from '../../../api/routes/my'
import '../../App.css'
import Header from '../../../components/Header'
import Main from '../../../components/Main'
import LoadingRows from '../../../components/Table/LoadingRows'
import { NetWorth } from '../../../types/Game'
import {
  abbreviateNumber,
  capitaliseFirstLetter,
  formatNumberCommas,
} from '../../../utils/helpers'

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
      <Header>
        Airlock{' '}
        <span className="ml-2 text-sm text-gray-600">
          SpaceTraders Web Client
        </span>
      </Header>
      <Main>
        <div className="lg:text-center">
          <h2 className="text-base font-semibold uppercase tracking-wide text-indigo-600">
            Status
          </h2>
          {!gameStatus.isLoading ? (
            <p className="mt-2 text-3xl font-extrabold leading-8 tracking-tight text-gray-900 sm:text-4xl">
              {capitaliseFirstLetter(gameStatus.data?.status ?? '')}
            </p>
          ) : (
            <div className="flex animate-pulse justify-center">
              <div className="mt-2 h-10 w-72 rounded-md bg-gray-300"></div>
            </div>
          )}
        </div>

        <div className="my-6 overflow-hidden bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Net Worth Leaderboard
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              How do you stack up against your fellow traders?
            </p>
          </div>
          <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                          Rank
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                          Username
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                          Net Worth
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {!leaderboardNetWorth.isLoading && !user.isLoading ? (
                        combinedLeaderboard.map((leaderboardUser, i) => (
                          <tr
                            key={i}
                            className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                          >
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium leading-5 text-gray-900">
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
                            <td className="whitespace-nowrap px-6 py-4 text-sm leading-5 text-gray-500">
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
                            <td className="whitespace-nowrap px-6 py-4 text-sm leading-5 text-gray-500">
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
      </Main>
    </>
  )
}
