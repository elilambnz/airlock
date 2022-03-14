import { ReactNode, useEffect, useState } from 'react'
import { useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { getMyAgent } from '../api/routes/agents'
import AuthContext from '../contexts/AuthContext'
import { API_TOKEN_KEY, removeValue } from '../utils/browserStorage'

interface AuthProviderProps {
  trackEvent: any
  children: ReactNode
}

export default function AuthProvider(props: AuthProviderProps) {
  const { trackEvent, children } = props

  const [apiToken, setApiToken] = useState<string>()
  const [apiTokenValid, setApiTokenValid] = useState(false)
  const [loading, setLoading] = useState(false)

  const queryClient = useQueryClient()

  useEffect(() => {
    if (apiTokenValid) {
      // queryClient.prefetchQuery('user', getMyAccount)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiTokenValid])

  const navigate = useNavigate()

  const signin = async (token: string, from: string) => {
    if (loading) {
      return
    }
    try {
      setLoading(true)
      setApiToken(token)
      const agent = await queryClient.fetchQuery('agent', getMyAgent)
      if (!agent) {
        throw new Error('User not found')
      }
      setApiTokenValid(true)
      // Send them back to the page they tried to visit when they were
      // redirected to the login page. Use { replace: true } so we don't create
      // another entry in the history stack for the login page.  This means that
      // when they get to the protected page and click the back button, they
      // won't end up back on the login page, which is also really nice for the
      // user experience.
      navigate(from, { replace: true })

      // Track the user's sign in
      trackEvent('signin', {
        props: {
          symbol: agent.data.symbol,
          headquarters: agent.data.headquarters,
          credits: String(agent.data.credits),
        },
      })
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signout = () => {
    setApiToken(undefined)
    setApiTokenValid(false)
    queryClient.removeQueries()
    removeValue(API_TOKEN_KEY, true)
    removeValue(API_TOKEN_KEY)
    window.location.reload()
  }

  const value = { apiToken, signin, signout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
