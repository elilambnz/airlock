import React, { useState, useEffect } from 'react'
import '../../App.css'

const axios = require('axios').default

function Trade() {
  const [tradeGoodForm, setTradeGoodForm] = useState<{
    shipId: string
    good: string
    quantity: number
  }>({
    shipId: '',
    good: '',
    quantity: 0,
  })
  const [tradeResult, setTradeResult] = useState(null)

  const handleSubmitTradeGoodForm = (e: any) => {
    e.preventDefault()
    axios
      .post(
        `https://api.spacetraders.io/my/sell-orders`,
        {
          shipId: tradeGoodForm.shipId,
          good: tradeGoodForm.good,
          quantity: tradeGoodForm.quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_TOKEN}`,
          },
        }
      )

      .then((res: any) => {
        setTradeResult(res.data)
      })
      .catch((err: any) => {
        console.log(err)
      })
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Trade</h1>
        <form onSubmit={handleSubmitTradeGoodForm}>
          <p>Trade Goods</p>
          <input
            type="text"
            name="shipId"
            placeholder="Ship ID"
            value={tradeGoodForm.shipId}
            onChange={(e) =>
              setTradeGoodForm((prev) => ({ ...prev, shipId: e.target.value }))
            }
          />
          <input
            type="text"
            name="good"
            placeholder="Good"
            value={tradeGoodForm.good}
            onChange={(e) =>
              setTradeGoodForm((prev) => ({ ...prev, good: e.target.value }))
            }
          />
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={tradeGoodForm.quantity}
            onChange={(e) =>
              setTradeGoodForm((prev) => ({
                ...prev,
                quantity: Number(e.target.value),
              }))
            }
          />
          <button type="submit">Trade</button>
        </form>
        <p>Result</p>
        <code>
          <pre>{JSON.stringify(tradeResult, undefined, 2)}</pre>
        </code>
      </header>
    </div>
  )
}

export default Trade
