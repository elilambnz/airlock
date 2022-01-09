import React from 'react'

interface SelectMenuProps {
  label?: string
  options: any[]
  onChange: (value: string) => void
}

const SelectMenu = (props: SelectMenuProps) => {
  const { options, label, onChange } = props

  return (
    <div>
      {label && (
        <label
          htmlFor="label"
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <select
        id="label"
        name="label"
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        onChange={(e) => {
          onChange(e.target.value)
        }}
      >
        <option value="">Select</option>
        {options.map(
          (
            option: {
              value: string
              label: string
            },
            i: React.Key
          ) => (
            <option key={i} value={option.value}>
              {option.label}
            </option>
          )
        )}
      </select>
    </div>
  )
}

export default SelectMenu
