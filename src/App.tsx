import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
  Outlet,
} from 'react-router-dom'
import './App.css'

import Navbar from './components/Navbar'
import Notifications from './components/Notifications'

import Home from './pages/Home'
import Account from './pages/Account'
import Marketplace from './pages/Marketplace'
import Systems from './pages/Systems'
import Structures from './pages/Structures'
import Automation from './pages/Automation'
import Loans from './pages/Loans'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

import Plausible from 'plausible-tracker'
import AuthProvider from './providers/AuthProvider'
import AutomationProvider from './providers/AutomationProvider'
import NotificationProvider from './providers/NotificationProvider'
import { useAuth } from './hooks/useAuth'

import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'

const { enableAutoPageviews, enableAutoOutboundTracking, trackEvent } =
  Plausible({
    domain: process.env.REACT_APP_DOMAIN,
    apiHost: process.env.REACT_APP_PLAUSIBLE_API_HOST,
  })
// This tracks the current page view and all future ones as well
enableAutoPageviews()
// Track all existing and future outbound links
enableAutoOutboundTracking()

const queryClient = new QueryClient()

export default function App() {
  const routes = [
    {
      path: '/',
      element: (
        <RequireAuth>
          <Home />
        </RequireAuth>
      ),
    },
    {
      path: 'account',
      element: (
        <RequireAuth>
          <Account />
        </RequireAuth>
      ),
    },
    {
      path: 'marketplace',
      element: (
        <RequireAuth>
          <Marketplace />
        </RequireAuth>
      ),
    },
    {
      path: 'systems',
      element: (
        <RequireAuth>
          <Systems />
        </RequireAuth>
      ),
    },
    {
      path: 'systems/:systemSymbol',
      element: (
        <RequireAuth>
          <Systems />
        </RequireAuth>
      ),
    },
    {
      path: 'structures',
      element: (
        <RequireAuth>
          <Structures />
        </RequireAuth>
      ),
    },
    {
      path: 'automation',
      element: (
        <RequireAuth>
          <Automation />
        </RequireAuth>
      ),
    },
    {
      path: 'loans',
      element: (
        <RequireAuth>
          <Loans />
        </RequireAuth>
      ),
    },
  ]

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider trackEvent={trackEvent}>
          <NotificationProvider>
            <AutomationProvider>
              <Routes>
                <Route element={<AppLayout />}>
                  {routes.map(({ path, element }) => (
                    <Route key={path} path={path} element={element} />
                  ))}
                </Route>
                <Route element={<AuthLayout />}>
                  <Route path="login" element={<Login />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </AutomationProvider>
          </NotificationProvider>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </BrowserRouter>
  )
}

function AppLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Outlet />
      <Notifications />
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
