import React, { useState } from 'react'
import { createSellOrder } from '../../api/routes/my'
import { OrderResponse } from '../../types/Order'
import '../../App.css'

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
  const [tradeResult, setTradeResult] = useState<OrderResponse>()

  const handleSubmitTradeGoodForm = async (e: any) => {
    e.preventDefault()
    setTradeResult(
      await createSellOrder(
        tradeGoodForm.shipId,
        tradeGoodForm.good,
        tradeGoodForm.quantity
      )
    )
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
