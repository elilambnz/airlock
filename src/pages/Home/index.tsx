import React, { useState, useEffect } from 'react'
import { getGameStatus, getLeaderboardNetWorth } from '../../api/routes/game'
import '../../App.css'
import { StatusResponse, LeaderboardNetWorthResponse } from '../../types/Game'

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

  return (
    <>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Airlock</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0"></div>
          <p>{gameStatus}</p>
          <h2>Leaderboard</h2>
          <code>
            <pre>{JSON.stringify(leaderboard, undefined, 2)}</pre>
          </code>
        </div>
      </main>
    </>
  )
}

export default Home
