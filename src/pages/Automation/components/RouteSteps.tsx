import { Dispatch, SetStateAction } from 'react'
import { RouteEventType, TradeRoute } from '../../../types/Automation'
import { GoodType } from '../../../types/Order'

interface RouteStepsProps {
  tradeRoute: TradeRoute
  setTradeRoute?: Dispatch<SetStateAction<TradeRoute>>
  notActive?: boolean
  handleResume?: (index: number) => void
}

const RouteSteps = (props: RouteStepsProps) => {
  const { tradeRoute, setTradeRoute, notActive, handleResume } = props

  const getIconForEvent = (event: RouteEventType) => {
    switch (event) {
      case RouteEventType.BUY:
      case RouteEventType.SELL:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
        )
      case RouteEventType.TRAVEL:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        )
      case RouteEventType.WARP_JUMP:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
            <path
              fillRule="evenodd"
              d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )
    }
  }

  const getColourForEvent = (event: RouteEventType) => {
    switch (event) {
      case RouteEventType.BUY:
        return 'bg-blue-500'
      case RouteEventType.SELL:
        return 'bg-green-500'
      case RouteEventType.TRAVEL:
      case RouteEventType.WARP_JUMP:
        return 'bg-gray-500'
      default:
        return 'bg-black-500'
    }
  }

  return (
    <div className="flow-root p-6">
      {tradeRoute.events.length > 0 ? (
        <ul className="-mb-8">
          {tradeRoute.events.map((event, i) => (
            <li key={i}>
              <div className="relative pb-8">
                {i !== tradeRoute.events.length - 1 && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  ></span>
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span
                      className={
                        'h-8 w-8 rounded-full flex items-center justify-center text-white ring-8 ring-white' +
                        ` ${getColourForEvent(event.type)}`
                      }
                    >
                      {getIconForEvent(event.type)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      {event.type === RouteEventType.BUY ? (
                        <p className="text-sm text-gray-500">
                          Buy{' '}
                          <span className="font-medium text-gray-900">
                            {event.good?.quantity} units
                          </span>{' '}
                          of{' '}
                          <span className="font-medium text-gray-900">
                            {/* @ts-expect-error */}
                            {GoodType[event.good?.good]}
                          </span>
                        </p>
                      ) : event.type === RouteEventType.SELL ? (
                        <p className="text-sm text-gray-500">
                          Sell{' '}
                          <span className="font-medium text-gray-900">
                            {event.good?.quantity} units
                          </span>{' '}
                          of{' '}
                          <span className="font-medium text-gray-900">
                            {/* @ts-expect-error */}
                            {GoodType[event.good?.good]}
                          </span>
                        </p>
                      ) : event.type === RouteEventType.TRAVEL ? (
                        <p className="text-sm text-gray-500">
                          Travel to{' '}
                          <span className="font-medium text-gray-900">
                            {event.location}
                          </span>
                        </p>
                      ) : event.type === RouteEventType.WARP_JUMP ? (
                        <p className="text-sm text-gray-500">
                          <span className="font-medium text-gray-900">
                            Warp jump
                          </span>
                        </p>
                      ) : (
                        ''
                      )}
                    </div>
                    {setTradeRoute && (
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={(e) => {
                            e.preventDefault()
                            setTradeRoute((prev) => ({
                              ...prev,
                              events: prev.events.filter((_, ei) => ei !== i),
                            }))
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    {notActive && handleResume && (
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        <button
                          className="text-green-600 hover:text-green-900"
                          onClick={(e) => {
                            e.preventDefault()
                            handleResume(i)
                          }}
                        >
                          Resume from step
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex justify-center">
          <div className="w-full py-4">
            <div className="flex flex-col items-center text-center mb-4">
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No steps have been added to this route.
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Start by adding either a trade or travel step.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RouteSteps
