import { ReactNode } from 'react'

export default function Section(props: { children: ReactNode }) {
  const { children } = props

  return (
    <div className="mb-6 overflow-hidden bg-white shadow sm:rounded-lg">
      {children}
    </div>
  )
}
