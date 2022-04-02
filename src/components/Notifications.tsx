import { useContext } from 'react'
import Toast from './Toast'
import {
  NotificationContext,
  NotificationType,
} from '../providers/NotificationProvider'
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/outline'

export default function Notifications() {
  const { messages, remove } = useContext(NotificationContext)

  const getIconForNotificationType = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS:
        return (
          <CheckCircleIcon
            className="h-6 w-6 text-green-400"
            aria-hidden="true"
          />
        )
      case NotificationType.ERROR:
        return (
          <ExclamationCircleIcon
            className="h-6 w-6 text-red-400"
            aria-hidden="true"
          />
        )
      case NotificationType.INFO:
        return (
          <InformationCircleIcon
            className="h-6 w-6 text-blue-400"
            aria-hidden="true"
          />
        )
      default:
        return null
    }
  }

  return (
    <>
      {/* Global notification live region, render this permanently at the end of the document */}
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 z-20 flex items-end px-4 py-6 sm:items-start sm:p-6"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
          {messages.map((message) => (
            <Toast
              key={message.id}
              title={message.title}
              message={message.message}
              type={message.type}
              open={true}
              icon={getIconForNotificationType(message.type)}
              onClose={() => {
                message.id && remove(message.id)
              }}
            />
          ))}
        </div>
      </div>
    </>
  )
}
