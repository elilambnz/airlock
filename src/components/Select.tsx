import React, { useEffect, useState } from 'react'

interface SelectProps {
  label?: string
  options: {
    value: string
    label: string
    tags?: (string | undefined)[]
    subTags?: (string | undefined)[]
    icon?: JSX.Element
  }[]
  value?: string
  onChange: (value: string) => void
}

const Select = (props: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const { label, options, value, onChange } = props

  useEffect(() => {
    const listboxButton = document.getElementById('listbox-button')
    const listbox = document.getElementById('listbox')

    const handleClickOutside = (event: MouseEvent) => {
      if (
        !listboxButton?.contains(event.target as Node) &&
        !listbox?.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
    } else {
      document.removeEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])

  const selectedOption = options.find((option) => option.value === value)

  return (
    <div>
      <label
        id="listbox-label"
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <div className="mt-1 relative">
        <button
          id="listbox-button"
          type="button"
          className={
            'relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm hover:cursor-pointer' +
            (!(options.length > 0) ? ' opacity-50 cursor-not-allowed' : '')
          }
          aria-haspopup="listbox"
          aria-expanded="true"
          aria-labelledby="listbox-label"
          disabled={!(options.length > 0)}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span className="flex items-center">
            {selectedOption?.icon && (
              <div className="flex-shrink-0">
                <div className="relative">
                  <span className="flex-shrink-0 h-5 w-5 rounded-full bg-white text-gray-400">
                    {selectedOption.icon}
                  </span>
                  <span
                    className="absolute inset-0 shadow-inner rounded-full"
                    aria-hidden="true"
                  ></span>
                </div>
              </div>
            )}
            <span
              className={
                'block truncate' + (selectedOption?.icon ? ' ml-2' : '')
              }
            >
              {selectedOption ? selectedOption.label : 'Select'}
              {selectedOption?.tags && (
                <div className="inline-flex text-xs text-gray-500">
                  {selectedOption.tags.map((tag) => (
                    <span className="ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </span>
          </span>
          <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>

        {isOpen && options.length > 0 && (
          <ul
            id="listbox"
            className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
            role="listbox"
            aria-labelledby="listbox-label"
            aria-activedescendant="listbox-option-3"
          >
            {options.map((option) => (
              <li
                key={option.value}
                className="text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-gray-300 hover:cursor-pointer"
                id="listbox-option-0"
                role="option"
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
              >
                <div className="flex items-center">
                  {option.icon && (
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-white text-gray-400">
                          {option.icon}
                        </span>
                        <span
                          className="absolute inset-0 shadow-inner rounded-full"
                          aria-hidden="true"
                        ></span>
                      </div>
                    </div>
                  )}
                  <span
                    className={
                      'block truncate' +
                      (option.value === value
                        ? ' font-semibold'
                        : ' font-normal') +
                      (option.icon ? ' ml-2' : '')
                    }
                  >
                    {option.label}
                    {option.tags && (
                      <div className="inline-flex text-xs text-gray-500">
                        {option.tags.map((tag) => (
                          <span className="ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {option.subTags && (
                      <div className="block -ml-1 mt-1">
                        {option.subTags.map((tag) => (
                          <span className="ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </span>
                </div>
                {option.value === value && (
                  <span className="text-indigo-600 absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Select
