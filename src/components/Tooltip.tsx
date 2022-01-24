import React from 'react'

interface ToolTipProps {
  children: React.ReactNode
  title: string
  className?: string
}

const Tooltip = (props: ToolTipProps) => {
  const { children, title, className } = props
  return (
    <div
      className={
        'relative flex flex-col items-center group' +
        (className ? `${className}` : '')
      }
    >
      {children}
      <div className="w-max absolute bottom-0 flex-col items-center hidden mb-6 group-hover:flex">
        <span className="relative z-10 p-2 text-xs leading-none text-white bg-gray-900 shadow-lg rounded-md">
          {title}
        </span>
        <div className="w-3 h-3 -mt-2 rotate-45 bg-gray-900"></div>
      </div>
    </div>
  )
}

export default Tooltip
