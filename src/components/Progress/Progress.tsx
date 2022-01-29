interface ProgressProps {
  percent: number
}

const Progress = (props: ProgressProps) => {
  const { percent } = props

  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5">
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

export default Progress
