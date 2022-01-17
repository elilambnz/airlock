import moment from 'moment'
import React, { useState, useEffect } from 'react'
import { listMyLoans, payOffLoan, takeOutLoan } from '../../api/routes/my'
import { listLoanTypes } from '../../api/routes/types'
import '../../App.css'
import { useUpdateUser } from '../../hooks/useUpdateUser'
import {
  ListLoansResponse,
  ListLoanTypesResponse,
  LoanStatus,
} from '../../types/Loan'
import { formatNumberCommas } from '../../utils/helpers'

function Loans() {
  const [loans, setLoans] = useState<ListLoansResponse>()
  const [availableLoans, setAvailableLoans] = useState<ListLoanTypesResponse>()

  const updateUser = useUpdateUser()

  useEffect(() => {
    const init = async () => {
      setLoans(await listMyLoans())
      setAvailableLoans(await listLoanTypes())
    }
    init()
  }, [])

  const handleTakeOutLoan = async (type: string) => {
    const result = await takeOutLoan(type)
    updateUser({ credits: result.credits })
    setLoans(await listMyLoans())
  }

  const handlePayOffLoan = async (id: string) => {
    const result = await payOffLoan(id)
    updateUser({ credits: result.credits })
    setLoans(await listMyLoans())
  }

  return (
    <>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Loans</h1>
        </div>
      </header>
      <main>
        <div className="bg-gray-100 min-h-screen">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto py-6">
              <h2 className="text-2xl font-bold text-gray-900">My Loans</h2>
            </div>

            <div className="flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    {loans && loans.loans.length > 0 ? (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                              Repayment Amount
                            </th>
                            <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                              Loan Due
                            </th>
                            <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {loans.loans.map((loan, i) => (
                            <tr
                              key={loan.id}
                              className={
                                i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                              }
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 font-medium text-gray-900">
                                {formatNumberCommas(loan.repaymentAmount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                {moment(loan.due).format('DD/MM/YYYY hh:mm a')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={
                                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full' +
                                    (loan.status === LoanStatus.CURRENT
                                      ? ' bg-green-100 text-green-800'
                                      : ' bg-yellow-100 text-yellow-800')
                                  }
                                >
                                  {loan.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                  {loan.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  className="text-indigo-600 hover:text-indigo-900"
                                  onClick={() => {
                                    handlePayOffLoan(loan.id)
                                  }}
                                >
                                  Pay Off Loan
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="px-6 py-4 bg-white text-center">
                        <p className="text-gray-500">You have no loans</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto py-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Available Loans
              </h2>
            </div>

            <div className="flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    {availableLoans && availableLoans.loans.length > 0 ? (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                              Loan Type
                            </th>
                            <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                              Interest Rate
                            </th>
                            <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                              Term in Days
                            </th>
                            <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                              Collateral Required
                            </th>
                            <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {availableLoans.loans.map((loan, i) => (
                            <tr
                              key={loan.type}
                              className={
                                i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                              }
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 font-medium text-gray-900">
                                {loan.type}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                {formatNumberCommas(loan.amount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                {loan.rate}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                {loan.termInDays}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
                                {loan.collateralRequired ? 'Yes' : 'No'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  className="text-indigo-600 hover:text-indigo-900"
                                  onClick={() => {
                                    handleTakeOutLoan(loan.type)
                                  }}
                                >
                                  Take Out Loan
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="px-6 py-4 bg-white text-center">
                        <p className="text-gray-500">No loans available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default Loans
