import { ReactNode } from 'react'

interface ToolTipProps {
  children: ReactNode
  title: string
  className?: string
}

export default function Tooltip(props: ToolTipProps) {
  const { children, title, className } = props
  return (
    <div
      className={
        'group relative flex flex-col items-center' +
        (className ? `${className}` : '')
      }
    >
      {children}
      <div className="absolute bottom-0 mb-6 hidden w-max flex-col items-center group-hover:flex">
        <span className="relative z-10 rounded-md bg-gray-900 p-2 text-xs leading-none text-white shadow-lg">
          {title}
        </span>
        <div className="-mt-2 h-3 w-3 rotate-45 bg-gray-900"></div>
      </div>
    </div>
  )
}
