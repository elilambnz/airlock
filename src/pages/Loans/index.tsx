import { useMutation, useQuery, useQueryClient } from 'react-query'
import { listMyLoans, payOffLoan, takeOutLoan } from '../../api/routes/my'
import { listLoanTypes } from '../../api/routes/types'
import '../../App.css'
import { LoanStatus, LoanTier } from '../../types/Loan'
import { formatNumberCommas, getErrorMessage } from '../../utils/helpers'
import moment from 'moment'
import LoadingRows from '../../components/Table/LoadingRows'
import { CreditCardIcon } from '@heroicons/react/solid'
import { useContext } from 'react'
import {
  NotificationContext,
  NotificationType,
} from '../../providers/NotificationProvider'
import Header from '../../components/Header'
import Main from '../../components/Main'
import Section from '../../components/Section'
import Title from '../../components/Title'

export default function Loans() {
  const { push } = useContext(NotificationContext)

  const queryClient = useQueryClient()
  const myLoans = useQuery('myLoans', listMyLoans)
  const availableLoans = useQuery('availableLoans', listLoanTypes)

  const handleTakeOutLoan = useMutation(
    ({ type }: { type: string }) => takeOutLoan(type),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('user')
        queryClient.invalidateQueries('myLoans')
        queryClient.invalidateQueries('availableLoans')
        push({
          title: 'Loan taken out',
          message: `${
            LoanTier[data.loan.type as unknown as keyof typeof LoanTier]
          } loan taken out`,
          type: NotificationType.SUCCESS,
        })
      },
      onError: (error: any) => {
        push({
          title: 'Error taking out loan',
          message: getErrorMessage(error),
          type: NotificationType.ERROR,
        })
      },
    }
  )

  const handlePayOffLoan = useMutation(
    ({ id }: { id: string }) => payOffLoan(id),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('user')
        queryClient.invalidateQueries('myLoans')
        queryClient.invalidateQueries('availableLoans')
        push({
          title: 'Loan paid off',
          message: `${
            LoanTier[data.loans[0].type as unknown as keyof typeof LoanTier]
          } loan paid off`,
          type: NotificationType.SUCCESS,
        })
      },
      onError: (error: any) => {
        push({
          title: 'Error paying off loan',
          message: getErrorMessage(error),
          type: NotificationType.ERROR,
        })
      },
    }
  )

  return (
    <>
      <Header>Loans</Header>
      <Main>
        <Title>My Loans</Title>

        <Section>
          <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  {myLoans.isLoading ||
                  (myLoans.data && myLoans.data.loans.length > 0) ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
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
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {!myLoans.isLoading ? (
                          myLoans.data.loans.map((loan, i) => (
                            <tr
                              key={loan.id}
                              className={
                                i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                              }
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {
                                  LoanTier[
                                    loan.type as unknown as keyof typeof LoanTier
                                  ]
                                }
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500">
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
                                  {
                                    LoanStatus[
                                      loan.status as unknown as keyof typeof LoanStatus
                                    ]
                                  }
                                </span>
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {loan.status === LoanStatus.CURRENT && (
                                  <button
                                    className={
                                      'text-indigo-600 hover:text-indigo-900' +
                                      (handlePayOffLoan.isLoading
                                        ? ' opacity-50 cursor-not-allowed'
                                        : '')
                                    }
                                    disabled={handlePayOffLoan.isLoading}
                                    onClick={() => {
                                      handlePayOffLoan.mutate({
                                        id: loan.id,
                                      })
                                    }}
                                  >
                                    Pay Off Loan
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <LoadingRows cols={5} rows={1} />
                        )}
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex justify-center">
                      <div className="w-full py-8 px-4">
                        <div className="flex flex-col items-center text-center mb-4">
                          <CreditCardIcon className="w-12 h-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">
                            You have no loans.
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Take out a loan to get started.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Title>Available Loans</Title>

        <Section>
          <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  {availableLoans.isLoading ||
                  (availableLoans.data &&
                    availableLoans.data.loans.length > 0) ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                            Type
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
                        {!availableLoans.isLoading ? (
                          availableLoans.data.loans.map((loan, i) => (
                            <tr
                              key={loan.type}
                              className={
                                i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                              }
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm leading-5 font-medium text-gray-900">
                                {
                                  LoanTier[
                                    loan.type as unknown as keyof typeof LoanTier
                                  ]
                                }
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
                                  className={
                                    'text-indigo-600 hover:text-indigo-900' +
                                    (handleTakeOutLoan.isLoading
                                      ? ' opacity-50 cursor-not-allowed'
                                      : '')
                                  }
                                  disabled={handleTakeOutLoan.isLoading}
                                  onClick={() => {
                                    handleTakeOutLoan.mutate({
                                      type: loan.type,
                                    })
                                  }}
                                >
                                  Take Out Loan
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <LoadingRows cols={6} rows={1} />
                        )}
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex justify-center">
                      <div className="w-full py-8 px-4">
                        <div className="flex flex-col items-center text-center mb-4">
                          <CreditCardIcon className="w-12 h-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">
                            No loans available.
                          </h3>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Section>
      </Main>
    </>
  )
}
