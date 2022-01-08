import React, { useState, useEffect } from 'react'
import '../../App.css'

const axios = require('axios').default

function Loans() {
  const [loans, setLoans] = useState(null)
  const [payLoanForm, setPayLoanForm] = useState({
    loanId: '',
  })
  const [availableLoans, setAvailableLoans] = useState(null)
  const [createLoanForm, setCreateLoanForm] = useState({
    type: '',
  })

  useEffect(() => {
    axios
      .get(`https://api.spacetraders.io/my/loans`, {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_TOKEN}`,
        },
      })

      .then((res: any) => {
        setLoans(res.data)
      })
      .catch((err: any) => {
        console.log(err)
      })

    axios
      .get(`https://api.spacetraders.io/types/loans`, {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_TOKEN}`,
        },
      })
      .then((res: any) => {
        setAvailableLoans(res.data)
      })
      .catch((err: any) => {
        console.log(err)
      })
  }, [])

  const handleSubmitPayLoanForm = (e: any) => {
    e.preventDefault()
    axios
      .put(`https://api.spacetraders.io/my/loans/${payLoanForm.loanId}`, {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_TOKEN}`,
        },
      })
      .then((res: any) => {
        console.log(res)
      })
      .catch((err: any) => {
        console.log(err)
      })
  }

  const handleSubmitCreateLoanForm = (e: any) => {
    e.preventDefault()
    axios
      .post(
        `https://api.spacetraders.io/my/loans`,
        {
          type: createLoanForm.type,
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
        <h1>Loans</h1>
        <h2>My Loans</h2>
        <code>
          <pre>{JSON.stringify(loans, undefined, 2)}</pre>
        </code>
        <form onSubmit={handleSubmitPayLoanForm}>
          <p>Pay off a loan</p>
          <input
            type="text"
            name="loanId"
            placeholder="Loan ID"
            value={payLoanForm.loanId}
            onChange={(e) =>
              setPayLoanForm((prev) => ({
                ...prev,
                loanId: e.target.value,
              }))
            }
          />
          <button type="submit">Pay</button>
        </form>
        <h2>Available loans</h2>
        <code>
          <pre>{JSON.stringify(availableLoans, undefined, 2)}</pre>
        </code>
        <form onSubmit={handleSubmitCreateLoanForm}>
          <p>Take out a loan</p>
          <input
            type="text"
            name="loanId"
            placeholder="Type"
            value={createLoanForm.type}
            onChange={(e) =>
              setCreateLoanForm((prev) => ({
                ...prev,
                loanId: e.target.value,
              }))
            }
          />
          <button type="submit">Submit</button>
        </form>
      </header>
    </div>
  )
}

export default Loans
