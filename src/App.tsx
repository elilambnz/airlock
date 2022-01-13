import React from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
  Outlet,
  useNavigate,
} from 'react-router-dom'
import './App.css'

import Navbar from './components/Navbar'

import Home from './pages/Home'
import Account from './pages/Account'
import Marketplace from './pages/Marketplace'
import Systems from './pages/Systems'
import Structures from './pages/Structures'
import Loans from './pages/Loans'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import { User } from './types/Account'
import { getMyAccount } from './api/routes/my'

import Plausible from 'plausible-tracker'
import { API_TOKEN_KEY, removeValue } from './utils/browserStorage'

const { enableAutoPageviews, enableAutoOutboundTracking, trackEvent } =
  Plausible({
    domain: process.env.REACT_APP_DOMAIN,
  })
// This tracks the current page view and all future ones as well
enableAutoPageviews()
// Track all existing and future outbound links
enableAutoOutboundTracking()

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Home />
                </RequireAuth>
              }
            />
            <Route
              path="/account"
              element={
                <RequireAuth>
                  <Account />
                </RequireAuth>
              }
            />
            <Route
              path="/marketplace"
              element={
                <RequireAuth>
                  <Marketplace />
                </RequireAuth>
              }
            />
            <Route
              path="/systems"
              element={
                <RequireAuth>
                  <Systems />
                </RequireAuth>
              }
            />
            <Route
              path="/structures"
              element={
                <RequireAuth>
                  <Structures />
                </RequireAuth>
              }
            />
            <Route
              path="/loans"
              element={
                <RequireAuth>
                  <Loans />
                </RequireAuth>
              }
            />
          </Route>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

function AppLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Outlet />
    </div>
  )
}

function AuthLayout() {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  )
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const location = useLocation()
  const auth = useAuth()

  if (!auth.apiToken) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

interface AuthContextType {
  user?: User
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>
  apiToken?: string
  signin: (token: string, from: string) => Promise<void>
  signout: () => void
}

export const AuthContext = React.createContext<AuthContextType>(null!)

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User>()
  const [apiToken, setApiToken] = React.useState<string>()
  const [loading, setLoading] = React.useState(false)

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

export function useAuth() {
  return React.useContext(AuthContext)
}

export default App
