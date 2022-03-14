import { PaperAirplaneIcon } from '@heroicons/react/solid'
import { Dispatch, SetStateAction } from 'react'
import { TradeRoute } from '../../../types/Automation'
import { getShipName } from '../../../utils/helpers'

interface AssignedShipsProps {
  tradeRoute: TradeRoute
  setTradeRoute?: Dispatch<SetStateAction<TradeRoute>>
}

export default function AssignedShips(props: AssignedShipsProps) {
  const { tradeRoute, setTradeRoute } = props

  return (
    <div className="flow-root p-6">
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
                  <PaperAirplaneIcon className="h-5 w-5" />
                </span>
                <div className="ml-2">
                  <p className="text-sm text-gray-900">{getShipName(ship)}</p>
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
        <div className="flex justify-center">
          <div className="w-full py-4">
            <div className="flex flex-col items-center text-center mb-4">
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No ships assigned.
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Select ships to assign to this trade route.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
