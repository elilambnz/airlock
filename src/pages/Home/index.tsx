import React, { useState, useEffect } from 'react'
import '../../App.css'

import axios from 'axios'

function Home() {
  const [gameStatus, setGameStatus] = useState(null)
  const [leaderboard, setLeaderboard] = useState(null)

  useEffect(() => {
    axios
      .get(`https://api.spacetraders.io/game/status`, {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_TOKEN}`,
        },
      })
      .then((res: any) => {
        setGameStatus(res.data?.status)
      })
      .catch((err: any) => {
        console.log(err)
      })

    axios
      .get(`https://api.spacetraders.io/game/leaderboard/net-worth`, {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_TOKEN}`,
        },
      })
      .then((res: any) => {
        setLeaderboard(res.data)
      })
      .catch((err: any) => {
        console.log(err)
      })
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
