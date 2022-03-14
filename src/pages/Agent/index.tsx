import { useContext, useEffect } from 'react'
import { getMyAgent } from '../../api/routes/agents'
import '../../App.css'
import { useQuery } from 'react-query'
import {
  NotificationContext,
  NotificationType,
} from '../../providers/NotificationProvider'
import Header from '../../components/Header'
import Main from '../../components/Main'

export default function Agent() {
  const { push } = useContext(NotificationContext)

  const agent = useQuery('agent', getMyAgent)

  useEffect(() => {
    if (agent.data) {
      push({
        title: 'Welcome back',
        message: `Welcome ${agent.data.data.symbol}`,
        type: NotificationType.SUCCESS,
      })
    }
  }, [agent.data])

  if (!agent.data) {
    return null
  }

  return (
    <>
      <Header>Agent</Header>
      <Main>
        <pre className="text-xs">
          {JSON.stringify(agent.data?.data, null, 2)}
        </pre>
      </Main>
    </>
  )
}
