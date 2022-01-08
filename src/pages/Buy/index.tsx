import React, { useState, useEffect } from 'react'
import { getLocationMarketplace } from '../../api/routes/locations'
import { buyShip, createPurchaseOrder } from '../../api/routes/my'
import { getShipListings } from '../../api/routes/systems'
import { listGoodTypes, listShipTypes } from '../../api/routes/types'
import '../../App.css'
import { LocationMarketplaceResponse } from '../../types/Location'
import { ListGoodTypesResponse } from '../../types/Order'
import { ListShipsResponse, ListShipTypesResponse } from '../../types/Ship'

const START_CURRENT_SYSTEM = 'OE'
const START_CURRENT_LOCATION = 'OE-PM-TR'

function Buy() {
  const [availableShips, setAvailableShips] = useState<ListShipsResponse>()
  const [marketplace, setMarketplace] = useState<LocationMarketplaceResponse>()
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
  const [goodTypes, setGoodTypes] = useState<ListGoodTypesResponse>()
  const [shipTypes, setShipTypes] = useState<ListShipTypesResponse>()

  useEffect(() => {
    const init = async () => {
      setAvailableShips(await getShipListings(START_CURRENT_SYSTEM))
      setMarketplace(await getLocationMarketplace(START_CURRENT_LOCATION))
      setGoodTypes(await listGoodTypes())
      setShipTypes(await listShipTypes())
    }
    init()
  }, [])

  const handleSubmitBuyShipForm = async (e: any) => {
    e.preventDefault()
    await buyShip(buyShipForm.location, buyShipForm.type)
  }

  const handleSubmitBuyGoodForm = async (e: any) => {
    e.preventDefault()
    await createPurchaseOrder(
      buyGoodForm.shipId,
      buyGoodForm.good,
      buyGoodForm.quantity
    )
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
          <pre>{JSON.stringify(availableShips, undefined, 2)}</pre>
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
