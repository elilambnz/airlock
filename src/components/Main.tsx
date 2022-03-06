import { ReactNode } from 'react'

export default function Main(props: { children: ReactNode }) {
  const { children } = props

  return (
    <main>
      <div
        className="bg-gray-100"
        style={{
          minHeight: 'calc(100vh - 148px)',
        }}
      >
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </main>
  )
}
