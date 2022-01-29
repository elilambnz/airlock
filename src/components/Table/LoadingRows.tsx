interface LoadingRowsProps {
  cols: number
  rows?: number
}

const LoadingRows = (props: LoadingRowsProps) => {
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
                  className="px-6 py-4 whitespace-nowrap animate-pulse"
                >
                  <div className="w-full bg-gray-300 h-5 rounded-md"></div>
                </td>
              ))}
          </tr>
        ))}
    </>
  )
}

export default LoadingRows
