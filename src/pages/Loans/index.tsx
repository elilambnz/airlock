import React, { useState, useEffect } from 'react'
import { getMyLoans, payOffLoan, takeOutLoan } from '../../api/routes/my'
import { getLoansTypes } from '../../api/routes/types'
import '../../App.css'

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
    const init = async () => {
      setLoans(await getMyLoans())
      setAvailableLoans(await getLoansTypes())
    }
    init()
  }, [])

  const handleSubmitPayLoanForm = async (e: any) => {
    e.preventDefault()
    await payOffLoan(payLoanForm.loanId)
  }

  const handleSubmitCreateLoanForm = async (e: any) => {
    e.preventDefault()
    await takeOutLoan(createLoanForm.type)
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
