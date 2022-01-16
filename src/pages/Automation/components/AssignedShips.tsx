import React from 'react'
import { TradeRoute } from '../../../types/Automation'

interface AssignedShipsProps {
  tradeRoute: TradeRoute
  setTradeRoute?: React.Dispatch<React.SetStateAction<TradeRoute>>
}

const AssignedShips = (props: AssignedShipsProps) => {
  const { tradeRoute, setTradeRoute } = props

  return (
    <div className="flow-root p-6 max-w-xl">
      {tradeRoute.assignedShips.length > 0 ? (
        tradeRoute.assignedShips.map((ship, i) => (
          <div key={i}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span
                  className={
                    'h-8 w-8 rounded-full flex items-center justify-center text-white ring-8 ring-white' +
                    ` bg-gray-500`
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </span>
                <div className="ml-2">
                  <p className="text-sm text-gray-900">{ship}</p>
                </div>
              </div>
              {setTradeRoute && (
                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={(e) => {
                      e.preventDefault()
                      setTradeRoute((prev) => ({
                        ...prev,
                        assignedShips: prev.assignedShips.filter(
                          (s) => s !== ship
                        ),
                      }))
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-500">No ships assigned.</p>
      )}
    </div>
  )
}

export default AssignedShips
