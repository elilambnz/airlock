import React, { useState, useEffect } from 'react'
import '../../App.css'

const axios = require('axios').default

const START_CURRENT_SYSTEM = 'OE'

function Systems() {
  const [currentSystem, setCurrentSystem] = useState(null)
  const [availableLocations, setAvailableLocations] = useState(null)
  const [allFlightPlans, setAllFlightPlans] = useState(null)
  const [createFlightPlanForm, setCreateFlightPlanForm] = useState<{
    shipId: string
    destination: string
  }>({
    shipId: '',
    destination: '',
  })
  const [flightPlanForm, setFlightPlanForm] = useState<{
    flightPlanId: string
  }>({
    flightPlanId: '',
  })
  const [currentFlightPlan, setCurrentFlightPlan] = useState(null)
  const [allDockedShips, setAllDockedShips] = useState(null)

  const updateCurrentSystem = (systemSymbol: string) => {
    axios
      .get(`https://api.spacetraders.io/systems/${systemSymbol}`, {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_TOKEN}`,
        },
      })
      .then((res: any) => {
        setCurrentSystem(res.data)
      })
      .catch((err: any) => {
        console.log(err)
      })

    axios
      .get(`https://api.spacetraders.io/systems/${systemSymbol}/locations`, {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_TOKEN}`,
        },
      })
      .then((res: any) => {
        setAvailableLocations(res.data)
      })
      .catch((err: any) => {
        console.log(err)
      })
  }

  useEffect(() => {
    updateCurrentSystem(START_CURRENT_SYSTEM)

    axios
      .get(
        `https://api.spacetraders.io/systems/${START_CURRENT_SYSTEM}/flight-plans`,
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_TOKEN}`,
          },
        }
      )
      .then((res: any) => {
        setAllFlightPlans(res.data)
      })
      .catch((err: any) => {
        console.log(err)
      })

    axios
      .get(
        `https://api.spacetraders.io/systems/${START_CURRENT_SYSTEM}/ships`,
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_TOKEN}`,
          },
        }
      )
      .then((res: any) => {
        setAllDockedShips(res.data)
      })
      .catch((err: any) => {
        console.log(err)
      })
  }, [])

  const handleSubmitCreateFlightPlanForm = (e: any) => {
    e.preventDefault()
    axios
      .post(
        `https://api.spacetraders.io/my/flight-plans`,
        {
          shipId: createFlightPlanForm.shipId,
          destination: createFlightPlanForm.destination,
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

  const handleSubmitFlightPlanForm = (e: any) => {
    e.preventDefault()
    axios
      .get(
        `https://api.spacetraders.io/my/flight-plans/${flightPlanForm.flightPlanId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_TOKEN}`,
          },
        }
      )
      .then((res: any) => {
        setCurrentFlightPlan(res.data)
      })
      .catch((err: any) => {
        console.log(err)
      })
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Systems</h1>
        <h2>Current system</h2>
        <code>
          <pre>{JSON.stringify(currentSystem, null, 2)}</pre>
        </code>
        <h2>Available locations</h2>
        <details>
          <summary>Show all</summary>
          <code>
            <pre>{JSON.stringify(availableLocations, undefined, 2)}</pre>
          </code>
        </details>
        <h2>Flight plans</h2>
        <p>All flight plans</p>
        <details>
          <summary>Show all</summary>
          <code>
            <pre>{JSON.stringify(allFlightPlans, undefined, 2)}</pre>
          </code>
        </details>
        <form onSubmit={handleSubmitCreateFlightPlanForm}>
          <p>New Flight Plan</p>
          <input
            type="text"
            name="shipId"
            placeholder="Ship ID"
            value={createFlightPlanForm.shipId}
            onChange={(e) =>
              setCreateFlightPlanForm((prev) => ({
                ...prev,
                shipId: e.target.value,
              }))
            }
          />
          <input
            type="text"
            name="destination"
            placeholder="Destination"
            value={createFlightPlanForm.destination}
            onChange={(e) =>
              setCreateFlightPlanForm((prev) => ({
                ...prev,
                destination: e.target.value,
              }))
            }
          />
          <button type="submit">Create</button>
        </form>
        <form onSubmit={handleSubmitFlightPlanForm}>
          <p>View Flight Plan</p>
          <input
            type="text"
            name="flightPlanId"
            placeholder="Flight Plan ID"
            value={flightPlanForm.flightPlanId}
            onChange={(e) =>
              setFlightPlanForm((prev) => ({
                ...prev,
                flightPlanId: e.target.value,
              }))
            }
          />
          <button type="submit">Find</button>
        </form>
        <code>
          <pre>{JSON.stringify(currentFlightPlan, undefined, 2)}</pre>
        </code>
        <h2>Docked ships</h2>
        <p>All docked ships</p>
        <details>
          <summary>Show all</summary>
          <code>
            <pre>{JSON.stringify(allDockedShips, undefined, 2)}</pre>
          </code>
        </details>
      </header>
    </div>
  )
}

export default Systems
