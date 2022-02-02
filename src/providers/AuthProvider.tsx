import { ReactNode, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyAccount } from '../api/routes/my'
import AuthContext from '../contexts/AuthContext'
import { User } from '../types/Account'
import { API_TOKEN_KEY, removeValue } from '../utils/browserStorage'

interface AuthProviderProps {
  trackEvent: any
  children: ReactNode
}

function AuthProvider(props: AuthProviderProps) {
  const { trackEvent, children } = props

  const [user, setUser] = useState<User>()
  const [apiToken, setApiToken] = useState<string>()
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const signin = async (token: string, from: string) => {
    if (loading) {
      return
    }
    try {
      setLoading(true)
      setApiToken(token)
      const user = await getMyAccount()
      if (!user) {
        throw new Error('User not found')
      }
      setUser(user.user)
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
          username: user.user.username,
          credits: String(user.user.credits),
          joinedAt: user.user.joinedAt,
          shipCount: String(user.user.shipCount),
          structureCount: String(user.user.structureCount),
        },
      })
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signout = () => {
    setUser(undefined)
    removeValue(API_TOKEN_KEY, true)
    removeValue(API_TOKEN_KEY)
    window.location.reload()
  }

  const value = { user, setUser, apiToken, signin, signout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider