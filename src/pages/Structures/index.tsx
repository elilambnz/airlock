import React, { useState, useEffect } from 'react'
import '../../App.css'

const axios = require('axios').default

function Structures() {
  const [allMyStructures, setAllMyStructures] = useState(null)
  const [myStructureInfoForm, setMyStructureInfoForm] = useState({
    structureId: '',
  })
  const [myStructureInfo, setMyStructureInfo] = useState(null)
  const [structureCreateForm, setStructureCreateForm] = useState({
    location: '',
    type: '',
  })
  const [structureCreate, setStructureCreate] = useState(null)
  const [myStructureDepositForm, setMyStructureDepositForm] = useState({
    structureId: '',
    shipId: '',
    good: '',
    quantity: 0,
  })
  const [myStructureDeposit, setMyStructureDeposit] = useState(null)
  const [myStructureWithdrawForm, setMyStructureWithdrawForm] = useState({
    structureId: '',
    shipId: '',
    good: '',
    quantity: 0,
  })
  const [myStructureWithdraw, setMyStructureWithdraw] = useState(null)
  const [structureInfoForm, setStructureInfoForm] = useState({
    structureId: '',
  })
  const [structureInfo, setStructureInfo] = useState(null)
  const [structureDepositForm, setStructureDepositForm] = useState({
    structureId: '',
    shipId: '',
    good: '',
    quantity: 0,
  })
  const [structureDeposit, setStructureDeposit] = useState(null)
  const [structureTypes, setStructureTypes] = useState(null)

  useEffect(() => {
    axios
      .get(`https://api.spacetraders.io/my/structures`, {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_TOKEN}`,
        },
      })
      .then((res: any) => {
        setAllMyStructures(res.data)
      })
      .catch((err: any) => {
        console.log(err)
      })

    axios
      .get(`https://api.spacetraders.io/types/structures`, {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_TOKEN}`,
        },
      })
      .then((res: any) => {
        setStructureTypes(res.data)
      })
  }, [])

  const handleSubmitMyStructureInfoForm = (e: any) => {
    e.preventDefault()
    axios
      .get(
        `https://api.spacetraders.io/my/structures/${structureInfoForm.structureId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_TOKEN}`,
          },
        }
      )
      .then((res: any) => {
        setMyStructureInfo(res.data)
      })
      .catch((err: any) => {
        console.log(err)
      })
  }

  const handleSubmitStructureCreateForm = (e: any) => {
    e.preventDefault()
    axios
      .post(
        `https://api.spacetraders.io/my/structures`,
        {
          location: structureCreateForm.location,
          type: structureCreateForm.type,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_TOKEN}`,
          },
        }
      )
      .then((res: any) => {
        setStructureCreate(res.data)
      })
      .catch((err: any) => {
        console.log(err)
      })
  }

  const handleSubmitMyStructureDepositForm = (e: any) => {
    e.preventDefault()
    axios
      .get(
        `https://api.spacetraders.io/my/structures/${myStructureDepositForm.structureId}/deposit`,
        {
          shipId: myStructureDepositForm.shipId,
          good: myStructureDepositForm.quantity,
          quantity: myStructureDepositForm.quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_TOKEN}`,
          },
        }
      )
      .then((res: any) => {
        setMyStructureDeposit(res.data)
      })
      .catch((err: any) => {
        console.log(err)
      })
  }

  const handleSubmitMyStructureWithdrawForm = (e: any) => {
    e.preventDefault()
    axios
      .post(
        `https://api.spacetraders.io/my/structures/${myStructureWithdrawForm.structureId}/transfer`,
        {
          shipId: myStructureWithdrawForm.shipId,
          good: myStructureWithdrawForm.good,
          quantity: myStructureWithdrawForm.quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_TOKEN}`,
          },
        }
      )
      .then((res: any) => {
        setMyStructureWithdraw(res.data)
      })
      .catch((err: any) => {
        console.log(err)
      })
  }

  const handleSubmitStructureInfoForm = (e: any) => {
    e.preventDefault()
    axios
      .get(
        `https://api.spacetraders.io/structures/${structureInfoForm.structureId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_TOKEN}`,
          },
        }
      )
      .then((res: any) => {
        setStructureInfo(res.data)
      })
      .catch((err: any) => {
        console.log(err)
      })
  }

  const handleSubmitStructureDepositForm = (e: any) => {
    e.preventDefault()
    axios
      .get(
        `https://api.spacetraders.io/structures/${structureDepositForm.structureId}/deposit`,
        {
          shipId: structureDepositForm.shipId,
          good: structureDepositForm.quantity,
          quantity: structureDepositForm.quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_TOKEN}`,
          },
        }
      )
      .then((res: any) => {
        setStructureDeposit(res.data)
      })
      .catch((err: any) => {
        console.log(err)
      })
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
