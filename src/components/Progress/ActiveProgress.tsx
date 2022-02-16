import { useState } from 'react'
import Progress from './Progress'
import { getProgress } from '../../utils/helpers'
import { Moment } from 'moment'

interface ActiveProgressProps {
  start: Moment
  end: Moment
}

export default function ActiveProgress(props: ActiveProgressProps) {
  const { start, end } = props

  const [percent, setPercent] = useState(0)

  const timer = setInterval(() => {
    if (percent < 100) {
      setPercent(getProgress(start, end))
    } else {
      clearInterval(timer)
    }
  }, 1000)

  return <Progress percent={percent} />
}
