import React, { useState, useEffect } from 'react'
import {
  createNewStructure,
  depositToMyStructure,
  getMyStructureInfo,
  listMyStructures,
  withdrawFromMyStructure,
} from '../../api/routes/my'
import {
  depositToStructure,
  getStructureInfo,
} from '../../api/routes/structures'
import { listStructureTypes } from '../../api/routes/types'
import '../../App.css'
import {
  ListOwnStructuresResponse,
  ListStructureTypesResponse,
  OwnStructureResponse,
  OwnStructureWithdrawResponse,
  OwnStrucutreDepositResponse,
  StructureResponse,
  StrucutreDepositResponse,
} from '../../types/Structure'

function Structures() {
  const [allMyStructures, setAllMyStructures] =
    useState<ListOwnStructuresResponse>()
  const [myStructureInfoForm, setMyStructureInfoForm] = useState({
    structureId: '',
  })
  const [myStructureInfo, setMyStructureInfo] = useState<OwnStructureResponse>()
  const [structureCreateForm, setStructureCreateForm] = useState({
    location: '',
    type: '',
  })
  const [structureCreate, setStructureCreate] = useState<OwnStructureResponse>()
  const [myStructureDepositForm, setMyStructureDepositForm] = useState({
    structureId: '',
    shipId: '',
    good: '',
    quantity: 0,
  })
  const [myStructureDeposit, setMyStructureDeposit] =
    useState<OwnStrucutreDepositResponse>()
  const [myStructureWithdrawForm, setMyStructureWithdrawForm] = useState({
    structureId: '',
    shipId: '',
    good: '',
    quantity: 0,
  })
  const [myStructureWithdraw, setMyStructureWithdraw] =
    useState<OwnStructureWithdrawResponse>()
  const [structureInfoForm, setStructureInfoForm] = useState({
    structureId: '',
  })
  const [structureInfo, setStructureInfo] = useState<StructureResponse>()
  const [structureDepositForm, setStructureDepositForm] = useState({
    structureId: '',
    shipId: '',
    good: '',
    quantity: 0,
  })
  const [structureDeposit, setStructureDeposit] =
    useState<StrucutreDepositResponse>()
  const [structureTypes, setStructureTypes] =
    useState<ListStructureTypesResponse>()

  useEffect(() => {
    const init = async () => {
      setAllMyStructures(await listMyStructures())
      setStructureTypes(await listStructureTypes())
    }
    init()
  }, [])

  const handleSubmitMyStructureInfoForm = async (e: any) => {
    e.preventDefault()
    setMyStructureInfo(
      await getMyStructureInfo(myStructureInfoForm.structureId)
    )
  }

  const handleSubmitStructureCreateForm = async (e: any) => {
    e.preventDefault()
    setStructureCreate(
      await createNewStructure(
        structureCreateForm.location,
        structureCreateForm.type
      )
    )
  }

  const handleSubmitMyStructureDepositForm = async (e: any) => {
    e.preventDefault()
    setMyStructureDeposit(
      await depositToMyStructure(
        myStructureDepositForm.structureId,
        myStructureDepositForm.shipId,
        myStructureDepositForm.good,
        myStructureDepositForm.quantity
      )
    )
  }

  const handleSubmitMyStructureWithdrawForm = async (e: any) => {
    e.preventDefault()
    setMyStructureWithdraw(
      await withdrawFromMyStructure(
        myStructureWithdrawForm.structureId,
        myStructureWithdrawForm.shipId,
        myStructureWithdrawForm.good,
        myStructureWithdrawForm.quantity
      )
    )
  }

  const handleSubmitStructureInfoForm = async (e: any) => {
    e.preventDefault()
    setStructureInfo(await getStructureInfo(structureInfoForm.structureId))
  }

  const handleSubmitStructureDepositForm = async (e: any) => {
    e.preventDefault()
    setStructureDeposit(
      await depositToStructure(
        structureDepositForm.structureId,
        structureDepositForm.shipId,
        structureDepositForm.good,
        structureDepositForm.quantity
      )
    )
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Structures</h1>
        <h2>My structures</h2>
        <code>
          <pre>{JSON.stringify(allMyStructures, undefined, 2)}</pre>
        </code>
        <form onSubmit={handleSubmitMyStructureInfoForm}>
          <p>Get my structure info</p>
          <input
            type="text"
            name="structureId"
            placeholder="Structure ID"
            value={myStructureInfoForm.structureId}
            onChange={(e) =>
              setMyStructureInfoForm((prev) => ({
                ...prev,
                structureId: e.target.value,
              }))
            }
          />
          <button type="submit">Submit</button>
        </form>
        <p>Result</p>
        <code>
          <pre>{JSON.stringify(myStructureInfo, undefined, 2)}</pre>
        </code>
        <form onSubmit={handleSubmitStructureCreateForm}>
          <p>Create structure</p>
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={structureCreateForm.location}
            onChange={(e) =>
              setStructureCreateForm((prev) => ({
                ...prev,
                location: e.target.value,
              }))
            }
          />
          <input
            type="text"
            name="type"
            placeholder="Type"
            value={structureCreateForm.type}
            onChange={(e) =>
              setStructureCreateForm((prev) => ({
                ...prev,
                type: e.target.value,
              }))
            }
          />
          <button type="submit">Submit</button>
        </form>
        <p>Result</p>
        <code>
          <pre>{JSON.stringify(structureCreate, undefined, 2)}</pre>
        </code>
        <form onSubmit={handleSubmitMyStructureDepositForm}>
          <p>Deposit to my structure</p>
          <input
            type="text"
            name="structureId"
            placeholder="Structure ID"
            value={myStructureDepositForm.structureId}
            onChange={(e) =>
              setMyStructureDepositForm((prev) => ({
                ...prev,
                structureId: e.target.value,
              }))
            }
          />
          <input
            type="text"
            name="shipId"
            placeholder="Ship ID"
            value={myStructureDepositForm.shipId}
            onChange={(e) =>
              setMyStructureDepositForm((prev) => ({
                ...prev,
                shipId: e.target.value,
              }))
            }
          />
          <input
            type="text"
            name="good"
            placeholder="Good"
            value={myStructureDepositForm.good}
            onChange={(e) =>
              setMyStructureDepositForm((prev) => ({
                ...prev,
                good: e.target.value,
              }))
            }
          />
          <input
            type="text"
            name="quantity"
            placeholder="Quantity"
            value={myStructureDepositForm.quantity}
            onChange={(e) =>
              setMyStructureDepositForm((prev) => ({
                ...prev,
                quantity: Number(e.target.value),
              }))
            }
          />
          <button type="submit">Deposit</button>
        </form>
        <p>Result</p>
        <code>
          <pre>{JSON.stringify(myStructureDeposit, undefined, 2)}</pre>
        </code>
        <form onSubmit={handleSubmitMyStructureWithdrawForm}>
          <p>Withdraw from my structure</p>
          <input
            type="text"
            name="structureId"
            placeholder="Structure ID"
            value={myStructureWithdrawForm.structureId}
            onChange={(e) =>
              setMyStructureWithdrawForm((prev) => ({
                ...prev,
                structureId: e.target.value,
              }))
            }
          />
          <input
            type="text"
            name="shipId"
            placeholder="Ship ID"
            value={myStructureWithdrawForm.shipId}
            onChange={(e) =>
              setMyStructureWithdrawForm((prev) => ({
                ...prev,
                shipId: e.target.value,
              }))
            }
          />
          <input
            type="text"
            name="good"
            placeholder="Good"
            value={myStructureWithdrawForm.good}
            onChange={(e) =>
              setMyStructureWithdrawForm((prev) => ({
                ...prev,
                good: e.target.value,
              }))
            }
          />
          <input
            type="text"
            name="quantity"
            placeholder="Quantity"
            value={myStructureWithdrawForm.quantity}
            onChange={(e) =>
              setMyStructureWithdrawForm((prev) => ({
                ...prev,
                quantity: Number(e.target.value),
              }))
            }
          />
          <button type="submit">Withdraw</button>
        </form>
        <p>Result</p>
        <code>
          <pre>{JSON.stringify(myStructureWithdraw, undefined, 2)}</pre>
        </code>
        <h2>Other structures</h2>
        <form onSubmit={handleSubmitStructureInfoForm}>
          <p>Get structure info</p>
          <input
            type="text"
            name="structureId"
            placeholder="Structure ID"
            value={structureInfoForm.structureId}
            onChange={(e) =>
              setStructureInfoForm((prev) => ({
                ...prev,
                structureId: e.target.value,
              }))
            }
          />
          <button type="submit">Submit</button>
        </form>
        <p>Result</p>
        <code>
          <pre>{JSON.stringify(structureInfo, undefined, 2)}</pre>
        </code>
        <form onSubmit={handleSubmitStructureDepositForm}>
          <p>Deposit to a structure</p>
          <input
            type="text"
            name="structureId"
            placeholder="Structure ID"
            value={structureDepositForm.structureId}
            onChange={(e) =>
              setStructureDepositForm((prev) => ({
                ...prev,
                structureId: e.target.value,
              }))
            }
          />
          <input
            type="text"
            name="shipId"
            placeholder="Ship ID"
            value={structureDepositForm.shipId}
            onChange={(e) =>
              setStructureDepositForm((prev) => ({
                ...prev,
                shipId: e.target.value,
              }))
            }
          />
          <input
            type="text"
            name="good"
            placeholder="Good"
            value={structureDepositForm.good}
            onChange={(e) =>
              setStructureDepositForm((prev) => ({
                ...prev,
                good: e.target.value,
              }))
            }
          />
          <input
            type="text"
            name="quantity"
            placeholder="Quantity"
            value={structureDepositForm.quantity}
            onChange={(e) =>
              setStructureDepositForm((prev) => ({
                ...prev,
                quantity: Number(e.target.value),
              }))
            }
          />
          <button type="submit">Deposit</button>
        </form>
        <p>Result</p>
        <code>
          <pre>{JSON.stringify(structureDeposit, undefined, 2)}</pre>
        </code>
        <h2>Structure types</h2>
        <details>
          <summary>Show all</summary>
          <code>
            <pre>{JSON.stringify(structureTypes, undefined, 2)}</pre>
          </code>
        </details>
      </header>
    </div>
  )
}

export default Structures
