import React, { useState, useEffect } from 'react'
import {
  getMyAccount,
  listMyShips,
  getShipInfo,
  jettisonShipCargo,
  scrapShip,
  transferShipCargo,
} from '../../api/routes/my'
import '../../App.css'

import { User } from '../../types/Account'
import {
  ListShipsResponse,
  ScrapShipResponse,
  ShipJettisonCargoResponse,
  ShipResponse,
  TransferShipCargoResponse,
} from '../../types/Ship'

function Account() {
  const [user, setUser] = useState<User>()
  const [myShips, setMyShips] = useState<ListShipsResponse>()
  const [shipInfoForm, setShipInfoForm] = useState({
    shipId: '',
  })
  const [shipInfo, setShipInfo] = useState<ShipResponse>()
  const [shipJettisonForm, setShipJettisonForm] = useState({
    shipId: '',
    good: '',
    quantity: 0,
  })
  const [shipJettison, setShipJettison] = useState<ShipJettisonCargoResponse>()
  const [shipScrapForm, setShipScrapForm] = useState({
    shipId: '',
  })
  const [shipScrap, setShipScrap] = useState<ScrapShipResponse>()
  const [shipTransferForm, setShipTransferForm] = useState({
    fromShipId: '',
    toShipId: '',
    good: '',
    quantity: 0,
  })
  const [shipTransfer, setShipTransfer] = useState<TransferShipCargoResponse>()

  useEffect(() => {
    const init = async () => {
      const account = await getMyAccount()
      setUser(account?.user)
      setMyShips(await listMyShips())
    }
    init()
  }, [])

  const handleSubmitShipInfoForm = async (e: any) => {
    e.preventDefault()
    setShipInfo(await getShipInfo(shipInfoForm.shipId))
  }

  const handleSubmitShipJettisonForm = async (e: any) => {
    e.preventDefault()
    setShipJettison(
      await jettisonShipCargo(
        shipJettisonForm.shipId,
        shipJettisonForm.good,
        shipJettisonForm.quantity
      )
    )
  }

  const handleSubmitShipScrapForm = async (e: any) => {
    e.preventDefault()
    setShipScrap(await scrapShip(shipScrapForm.shipId))
  }

  const handleSubmitShipTransferForm = async (e: any) => {
    e.preventDefault()
    setShipTransfer(
      await transferShipCargo(
        shipTransferForm.fromShipId,
        shipTransferForm.toShipId,
        shipTransferForm.good,
        shipTransferForm.quantity
      )
    )
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Me</h1>
        <code>
          <pre>{JSON.stringify(user, undefined, 2)}</pre>
        </code>
        <h2>My Ships</h2>
        <code>
          <pre>{JSON.stringify(myShips, undefined, 2)}</pre>
        </code>
        <form onSubmit={handleSubmitShipInfoForm}>
          <p>Get ship info</p>
          <input
            type="text"
            name="shipId"
            placeholder="Ship ID"
            value={shipInfoForm.shipId}
            onChange={(e) =>
              setShipInfoForm((prev) => ({
                ...prev,
                shipId: e.target.value,
              }))
            }
          />
          <button type="submit">Submit</button>
        </form>
        <p>Result</p>
        <code>
          <pre>{JSON.stringify(shipInfo, undefined, 2)}</pre>
        </code>
        <form onSubmit={handleSubmitShipJettisonForm}>
          <p>Jettison ship cargo</p>
          <input
            type="text"
            name="shipId"
            placeholder="Ship ID"
            value={shipJettisonForm.shipId}
            onChange={(e) =>
              setShipJettisonForm((prev) => ({
                ...prev,
                shipId: e.target.value,
              }))
            }
          />
          <input
            type="text"
            name="good"
            placeholder="Good"
            value={shipJettisonForm.good}
            onChange={(e) =>
              setShipJettisonForm((prev) => ({
                ...prev,
                good: e.target.value,
              }))
            }
          />
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={shipJettisonForm.quantity}
            onChange={(e) =>
              setShipJettisonForm((prev) => ({
                ...prev,
                quantity: Number(e.target.value),
              }))
            }
          />
          <button type="submit">Jettison cargo</button>
        </form>
        <p>Result</p>
        <code>
          <pre>{JSON.stringify(shipJettison, undefined, 2)}</pre>
        </code>
        <form onSubmit={handleSubmitShipScrapForm}>
          <p>Scrap ship for credits</p>
          <input
            type="text"
            name="shipId"
            placeholder="Ship ID"
            value={shipScrapForm.shipId}
            onChange={(e) =>
              setShipScrapForm((prev) => ({
                ...prev,
                shipId: e.target.value,
              }))
            }
          />
          <button type="submit">Scrap</button>
        </form>
        <p>Result</p>
        <code>
          <pre>{JSON.stringify(shipScrap, undefined, 2)}</pre>
        </code>
        <form onSubmit={handleSubmitShipTransferForm}>
          <p>Transfer cargo between ships</p>
          <input
            type="text"
            name="fromShipId"
            placeholder="From ship ID"
            value={shipTransferForm.fromShipId}
            onChange={(e) =>
              setShipTransferForm((prev) => ({
                ...prev,
                fromShipId: e.target.value,
              }))
            }
          />
          <input
            type="text"
            name="toShipId"
            placeholder="To ship ID"
            value={shipTransferForm.toShipId}
            onChange={(e) =>
              setShipTransferForm((prev) => ({
                ...prev,
                toShipId: e.target.value,
              }))
            }
          />
          <input
            type="text"
            name="good"
            placeholder="Good"
            value={shipTransferForm.good}
            onChange={(e) =>
              setShipTransferForm((prev) => ({
                ...prev,
                good: e.target.value,
              }))
            }
          />
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={shipTransferForm.quantity}
            onChange={(e) =>
              setShipTransferForm((prev) => ({
                ...prev,
                quantity: Number(e.target.value),
              }))
            }
          />
          <button type="submit">Transfer</button>
        </form>
        <p>Result</p>
        <code>
          <pre>{JSON.stringify(shipTransfer, undefined, 2)}</pre>
        </code>
      </header>
    </div>
  )
}

export default Account
