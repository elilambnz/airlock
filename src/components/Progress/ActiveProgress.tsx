import React from 'react'
import Progress from './Progress'
import { getProgress } from '../../utils/helpers'
import { Moment } from 'moment'

interface ActiveProgressProps {
  start: Moment
  end: Moment
}

const ActiveProgress = (props: ActiveProgressProps) => {
  const { start, end } = props

  const [percent, setPercent] = React.useState(0)

  const timer = setInterval(() => {
    if (percent < 100) {
      setPercent(getProgress(start, end))
    } else {
      clearInterval(timer)
    }
  }, 1000)

  return <Progress percent={percent} />
}

export default ActiveProgress
