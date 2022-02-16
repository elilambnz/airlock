import { XCircleIcon } from '@heroicons/react/solid'

interface AlertProps {
  title: string
  message: string
}

export default function Alert(props: AlertProps) {
  const { title, message } = props

  return (
    <div className="mx-auto">
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{title}</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{message}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
