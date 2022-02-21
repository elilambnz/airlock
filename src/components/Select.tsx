import { Fragment, useEffect, useRef, useState } from 'react'
import { Listbox, Portal, Transition } from '@headlessui/react'
import { CheckIcon, SelectorIcon, XIcon } from '@heroicons/react/solid'
import { usePopper } from 'react-popper'

interface SelectOption {
  value: string
  label: string
  tags?: (string | undefined)[]
  icon?: JSX.Element
  disabled?: boolean
}

interface SelectProps {
  label?: string
  options: SelectOption[]
  value?: string
  disabled?: boolean
  onChange: (value: string) => void
  onClear?: () => void
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Select(props: SelectProps) {
  const { label, options, value, disabled, onChange, onClear } = props

  const [selected, setSelected] = useState<SelectOption>()

  useEffect(() => {
    setSelected(
      value ? options.find((option) => option.value === value) : undefined
    )
  }, [value, options])

  const popperElRef = useRef(null)
  const [targetElement, setTargetElement] = useState(null)
  const [popperElement, setPopperElement] = useState(null)
  const { styles, attributes } = usePopper(targetElement, popperElement, {
    placement: 'bottom-start',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 8],
        },
      },
    ],
  })

  const selectDisabled = disabled || !(options.length > 0)

  return (
    <Listbox
      value={selected}
      onChange={(option) => {
        setSelected(option)
        if (option) {
          onChange(option.value)
        }
      }}
      disabled={selectDisabled}
    >
      {({ open }) => (
        <>
          <Listbox.Label className="block text-sm font-medium text-gray-700">
            {label}
          </Listbox.Label>
          <div className="mt-1 relative">
            <Listbox.Button
              ref={setTargetElement as any}
              className={
                'bg-white relative w-full border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm' +
                (selectDisabled ? ' opacity-50 cursor-not-allowed' : '') +
                (onClear && selected ? ' pr-12' : '')
              }
            >
              <span className="flex items-center">
                {selected?.icon && (
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <span className="flex-shrink-0 h-5 w-5 rounded-full bg-white text-gray-400">
                        {selected.icon}
                      </span>
                      <span
                        className="absolute inset-0 shadow-inner rounded-full"
                        aria-hidden="true"
                      ></span>
                    </div>
                  </div>
                )}
                <span
                  className={'block truncate' + (selected?.icon ? ' ml-2' : '')}
                >
                  {selected ? selected.label : 'Select'}
                  {selected?.tags && (
                    <div className="inline-flex text-xs text-gray-500">
                      {selected.tags.slice(0, 2).map((tag, i) => (
                        <span
                          key={i}
                          className="ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </span>
              </span>{' '}
              {onClear && selected && (
                <>
                  <button
                    className="absolute inset-y-0 right-6 flex items-center pr-2"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelected(undefined)
                      onClear()
                    }}
                  >
                    <XIcon
                      className="h-4 w-4 text-indigo-600 hover:text-indigo-900"
                      aria-hidden="true"
                    />
                  </button>{' '}
                </>
              )}
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <SelectorIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Portal>
              <div
                ref={popperElRef}
                style={{
                  ...styles.popper,
                  // @ts-expect-error
                  minWidth: targetElement?.scrollWidth,
                  maxWidth: 'calc(100vw - 16px)',
                }}
                {...attributes.popper}
              >
                <Transition
                  show={open}
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                  beforeEnter={() => setPopperElement(popperElRef.current)}
                  afterLeave={() => setPopperElement(null)}
                >
                  <Listbox.Options
                    static
                    className="bg-white shadow-lg max-h-60 max-w-full rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
                  >
                    {options.map((option) => (
                      <Listbox.Option
                        key={option.value}
                        className={({ active }) =>
                          classNames(
                            active
                              ? 'text-white bg-indigo-600'
                              : 'text-gray-900',
                            'cursor-default select-none relative py-2 pl-3 pr-9'
                          )
                        }
                        value={option}
                        disabled={option.disabled}
                      >
                        {({ selected, active }) => (
                          <div
                            className={
                              'flex items-center' +
                              (option.disabled
                                ? ' opacity-50 cursor-not-allowed'
                                : '')
                            }
                          >
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
                                  {option.tags.map((tag, i) => (
                                    <span
                                      key={i}
                                      className="ml-1 px-2 inline-flex text-xs leading-5 rounded-full bg-gray-100"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </span>

                            {selected ? (
                              <span
                                className={classNames(
                                  active ? 'text-white' : 'text-indigo-600',
                                  'absolute inset-y-0 right-0 flex items-center pr-4'
                                )}
                              >
                                <CheckIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              </span>
                            ) : null}
                          </div>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Portal>
          </div>
        </>
      )}
    </Listbox>
  )
}
