import { ReactNode } from 'react'

export default function Title(props: { children: ReactNode }) {
  const { children } = props

  return (
    <div className="max-w-7xl mx-auto py-6">
      <h2 className="text-2xl font-bold text-gray-900">{children}</h2>
    </div>
  )
}
