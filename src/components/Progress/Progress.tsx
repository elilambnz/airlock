interface ProgressProps {
  percent: number
}

export default function Progress(props: ProgressProps) {
  const { percent } = props

  return (
    <div className="h-1.5 w-full rounded-full bg-gray-200">
      <div
        className={
          'h-1.5 rounded-full' +
          (percent < 100 ? ' bg-indigo-600' : ' bg-emerald-600')
        }
        style={{ width: `${percent}%` }}
      ></div>
    </div>
  )
}
