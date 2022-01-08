import React, { useState, useEffect } from 'react'
import { createNewFlightPlan, getFlightPlanInfo } from '../../api/routes/my'
import {
  getSystemDockedShips,
  getSystemFlightPlans,
  getSystemInfo,
  getSystemLocations,
} from '../../api/routes/systems'
import '../../App.css'
import { FlightPlanResponse } from '../../types/FlightPlan'
import {
  ListSystemFlightPlansResponse,
  ListSystemLocationsResponse,
  SystemDockedShipsResponse,
  SystemsResponse,
} from '../../types/System'

const START_CURRENT_SYSTEM = 'OE'

function Systems() {
  const [currentSystem, setCurrentSystem] = useState<SystemsResponse>()
  const [availableLocations, setAvailableLocations] =
    useState<ListSystemLocationsResponse>()
  const [allFlightPlans, setAllFlightPlans] =
    useState<ListSystemFlightPlansResponse>()
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
  const [currentFlightPlan, setCurrentFlightPlan] =
    useState<FlightPlanResponse>()
  const [allDockedShips, setAllDockedShips] =
    useState<SystemDockedShipsResponse>()

  const updateCurrentSystem = async (systemSymbol: string) => {
    setCurrentSystem(await getSystemInfo(systemSymbol))
    setAvailableLocations(await getSystemLocations(systemSymbol))
  }

  useEffect(() => {
    updateCurrentSystem(START_CURRENT_SYSTEM)

    const init = async () => {
      setAllFlightPlans(await getSystemFlightPlans(START_CURRENT_SYSTEM))
      setAllDockedShips(await getSystemDockedShips(START_CURRENT_SYSTEM))
    }
    init()
  }, [])

  const handleSubmitCreateFlightPlanForm = async (e: any) => {
    e.preventDefault()
    await createNewFlightPlan(
      createFlightPlanForm.shipId,
      createFlightPlanForm.destination
    )
  }

  const handleSubmitFlightPlanForm = async (e: any) => {
    e.preventDefault()
    setCurrentFlightPlan(await getFlightPlanInfo(flightPlanForm.flightPlanId))
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
