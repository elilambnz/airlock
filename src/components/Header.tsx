import { ReactNode } from 'react'

export default function Header(props: { children: ReactNode }) {
  const { children } = props

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">{children}</h1>
      </div>
    </header>
  )
}
