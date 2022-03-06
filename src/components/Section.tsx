import { ReactNode } from 'react'

export default function Section(props: { children: ReactNode }) {
  const { children } = props

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      {children}
    </div>
  )
}
