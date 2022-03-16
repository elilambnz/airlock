import { InformationCircleIcon } from '@heroicons/react/outline'
import {
  CheckCircleIcon,
  ExclamationIcon,
  XCircleIcon,
} from '@heroicons/react/solid'

export enum AlertType {
  INFO = 'Info',
  SUCCESS = 'Success',
  WARNING = 'Warning',
  ERROR = 'Error',
}

interface AlertProps {
  title: string | JSX.Element
  message?: string
  type?: AlertType
}

function getIcon(type: AlertType) {
  switch (type) {
    case AlertType.INFO:
      return (
        <InformationCircleIcon
          className="h-5 w-5 text-blue-400"
          aria-hidden="true"
        />
      )
    case AlertType.SUCCESS:
      return (
        <CheckCircleIcon
          className="h-5 w-5 text-green-400"
          aria-hidden="true"
        />
      )
    case AlertType.WARNING:
      return (
        <ExclamationIcon
          className="h-5 w-5 text-yellow-400"
          aria-hidden="true"
        />
      )
    case AlertType.ERROR:
      return <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
  }
}

function getBgClassname(type: AlertType) {
  switch (type) {
    case AlertType.INFO:
      return 'bg-blue-50'
    case AlertType.SUCCESS:
      return 'bg-green-50'
    case AlertType.WARNING:
      return 'bg-yellow-50'
    case AlertType.ERROR:
      return 'bg-red-50'
  }
}

function getTitleClassname(type: AlertType) {
  switch (type) {
    case AlertType.INFO:
      return 'text-blue-800'
    case AlertType.SUCCESS:
      return 'text-green-800'
    case AlertType.WARNING:
      return 'text-yellow-800'
    case AlertType.ERROR:
      return 'text-red-800'
  }
}

function getMessageClassname(type: AlertType) {
  switch (type) {
    case AlertType.INFO:
      return 'text-blue-700'
    case AlertType.SUCCESS:
      return 'text-green-700'
    case AlertType.WARNING:
      return 'text-yellow-700'
    case AlertType.ERROR:
      return 'text-red-700'
  }
}

export default function Alert(props: AlertProps) {
  const { title, message, type = AlertType.ERROR } = props

  return (
    <div className="mx-auto">
      <div className={'rounded-md p-4 ' + getBgClassname(type)}>
        <div className="flex">
          <div className="flex-shrink-0">{getIcon(type)}</div>
          <div className="ml-3">
            <h3 className={'text-sm font-medium ' + getTitleClassname(type)}>
              {title}
            </h3>
            {message && (
              <div className={'mt-2 text-sm ' + getMessageClassname(type)}>
                <p>{message}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
