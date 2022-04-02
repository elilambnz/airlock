import { Fragment, useEffect, useState } from 'react'
import { Transition } from '@headlessui/react'
import { XIcon } from '@heroicons/react/solid'
import { Notification } from '../providers/NotificationProvider'

interface ToastProps extends Notification {
  open: boolean
  icon: JSX.Element | null
  onClose: () => void
  duration?: number
}

export default function Toast(props: ToastProps) {
  const { title, message, open, icon, onClose, duration } = props

  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(open)
    setTimeout(() => {
      handleClose()
    }, duration || 5000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleClose = () => {
    setIsOpen(false)
    // Wait for the animation to finish before calling onClose
    setTimeout(() => {
      onClose()
    }, 100)
  }

  return (
    <Transition
      show={isOpen}
      as={Fragment}
      enter="ease-out duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">{icon}</div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-gray-900">{title}</p>
              <p className="mt-1 text-sm text-gray-500">{message}</p>
            </div>
            <div className="ml-4 flex flex-shrink-0">
              <button
                className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                onClick={() => handleClose()}
              >
                <span className="sr-only">Close</span>
                <XIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  )
}
