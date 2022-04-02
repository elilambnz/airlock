interface LoadingRowsProps {
  cols: number
  rows?: number
}

export default function LoadingRows(props: LoadingRowsProps) {
  const { cols, rows } = props

  return (
    <>
      {Array(rows ?? 10)
        .fill(0)
        .map((_, i) => (
          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
            {Array(cols)
              .fill(0)
              .map((_, j) => (
                <td
                  key={j}
                  className="animate-pulse whitespace-nowrap px-6 py-4"
                >
                  <div className="h-5 w-full rounded-md bg-gray-300"></div>
                </td>
              ))}
          </tr>
        ))}
    </>
  )
}
