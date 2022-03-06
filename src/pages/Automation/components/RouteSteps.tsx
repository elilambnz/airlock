import {
  CashIcon,
  ChevronDoubleRightIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/solid'
import { Dispatch, SetStateAction } from 'react'
import { RouteEventType, TradeRoute } from '../../../types/Automation'
import { GoodType } from '../../../types/Order'

interface RouteStepsProps {
  tradeRoute: TradeRoute
  setTradeRoute?: Dispatch<SetStateAction<TradeRoute>>
  notActive?: boolean
  handleResume?: (index: number) => void
}

export default function RouteSteps(props: RouteStepsProps) {
  const { tradeRoute, setTradeRoute, notActive, handleResume } = props

  const getIconForEvent = (event: RouteEventType) => {
    switch (event) {
      case RouteEventType.BUY:
      case RouteEventType.SELL:
        return <CashIcon className="h-5 w-5" />
      case RouteEventType.TRAVEL:
        return <PaperAirplaneIcon className="h-5 w-5" />
      case RouteEventType.WARP_JUMP:
        return <ChevronDoubleRightIcon className="h-5 w-5" />
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
                            {`${event.good?.quantity} unit${
                              (event.good?.quantity ?? 0) > 1 ? 's' : ''
                            }`}
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
                            {`${event.good?.quantity} unit${
                              (event.good?.quantity ?? 0) > 1 ? 's' : ''
                            }`}{' '}
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
                Start by adding either a travel or trade step.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
