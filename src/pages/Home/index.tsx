import React, { useState, useEffect } from 'react'
import { getGameStatus, getLeaderboard } from '../../api/routes/game'
import '../../App.css'

function Home() {
  const [gameStatus, setGameStatus] = useState(null)
  const [leaderboard, setLeaderboard] = useState(null)

  useEffect(() => {
    const init = async () => {
      setGameStatus(await getGameStatus())
      setLeaderboard(await getLeaderboard())
    }
    init()
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <h1>Airlock</h1>
        <p>{gameStatus}</p>
        <h2>Leaderboard</h2>
        <code>
          <pre>{JSON.stringify(leaderboard, undefined, 2)}</pre>
        </code>
      </header>
    </div>
  )
}

export default Home
