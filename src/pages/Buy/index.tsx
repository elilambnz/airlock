import React, { useState, useEffect } from 'react'
import '../../App.css'

const axios = require('axios').default

function Buy() {
  const [ships, setShips] = useState(null)
  const [marketplace, setMarketplace] = useState(null)
  const [buyShipForm, setBuyShipForm] = useState<{
    location: string
    type: string
  }>({
    location: '',
    type: '',
  })
  const [buyGoodForm, setBuyGoodForm] = useState<{
    shipId: string
    good: string
    quantity: number
  }>({
    shipId: '',
    good: '',
    quantity: 0,
  })
  const [goodTypes, setGoodTypes] = useState(null)
  const [shipTypes, setShipTypes] = useState(null)

  useEffect(() => {
    axios
      .get(`https://api.spacetraders.io/systems/OE/ship-listings`, {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_TOKEN}`,
        },
      })
      .then((res: any) => {
        setShips(res.data)
      })
      .catch((err: any) => {
        console.log(err)
      })

    axios
      .get(`https://api.spacetraders.io/locations/OE-PM-TR/marketplace`, {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_TOKEN}`,
        },
      })
      .then((res: any) => {
        setMarketplace(res.data)
      })
      .catch((err: any) => {
        console.log(err)
      })

    axios
      .get(`https://api.spacetraders.io/types/goods`, {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_TOKEN}`,
        },
      })
      .then((res: any) => {
        setGoodTypes(res.data)
      })

    axios
      .get(`https://api.spacetraders.io/types/ships`, {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_TOKEN}`,
        },
      })
      .then((res: any) => {
        setShipTypes(res.data)
      })
  }, [])

  const handleSubmitBuyShipForm = (e: any) => {
    e.preventDefault()
    axios
      .post(
        `https://api.spacetraders.io/my/ships`,
        {
          location: buyShipForm.location,
          type: buyShipForm.type,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_TOKEN}`,
          },
        }
      )

      .then((res: any) => {
        console.log(res)
      })
      .catch((err: any) => {
        console.log(err)
      })
  }

  const handleSubmitBuyGoodForm = (e: any) => {
    e.preventDefault()
    axios
      .post(
        `https://api.spacetraders.io/my/purchase-orders`,
        {
          shipId: buyGoodForm.shipId,
          good: buyGoodForm.good,
          quantity: buyGoodForm.quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_TOKEN}`,
          },
        }
      )

      .then((res: any) => {
        console.log(res)
      })
      .catch((err: any) => {
        console.log(err)
      })
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Buy</h1>
        <form onSubmit={handleSubmitBuyGoodForm}>
          <p>Buy Goods</p>
          <input
            type="text"
            name="shipId"
            placeholder="Ship ID"
            value={buyGoodForm.shipId}
            onChange={(e) =>
              setBuyGoodForm((prev) => ({ ...prev, shipId: e.target.value }))
            }
          />
          <input
            type="text"
            name="good"
            placeholder="Good"
            value={buyGoodForm.good}
            onChange={(e) =>
              setBuyGoodForm((prev) => ({ ...prev, good: e.target.value }))
            }
          />
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={buyGoodForm.quantity}
            onChange={(e) =>
              setBuyGoodForm((prev) => ({
                ...prev,
                quantity: Number(e.target.value),
              }))
            }
          />
          <button type="submit">Buy</button>
        </form>
        <h2>Marketplace</h2>
        <code>
          <pre>{JSON.stringify(marketplace, undefined, 2)}</pre>
        </code>
        <h3>Good types</h3>
        <details>
          <summary>Show all</summary>
          <code>
            <pre>{JSON.stringify(goodTypes, undefined, 2)}</pre>
          </code>
        </details>
        <h2>Available Ships</h2>
        <code>
          <pre>{JSON.stringify(ships, undefined, 2)}</pre>
        </code>
        <h3>Ship types</h3>
        <details>
          <summary>Show all</summary>
          <code>
            <pre>{JSON.stringify(shipTypes, undefined, 2)}</pre>
          </code>
        </details>
        <form onSubmit={handleSubmitBuyShipForm}>
          <p>Buy Ship</p>
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={buyShipForm.location}
            onChange={(e) =>
              setBuyShipForm((prev) => ({ ...prev, location: e.target.value }))
            }
          />
          <input
            type="text"
            name="type"
            placeholder="Type"
            value={buyShipForm.type}
            onChange={(e) =>
              setBuyShipForm((prev) => ({ ...prev, type: e.target.value }))
            }
          />
          <button type="submit">Buy</button>
        </form>
      </header>
    </div>
  )
}

export default Buy
