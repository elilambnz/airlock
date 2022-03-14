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
import Agent from './pages/Agent'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

import Plausible from 'plausible-tracker'
import AuthProvider from './providers/AuthProvider'
import NotificationProvider from './providers/NotificationProvider'
import { useAuth } from './hooks/useAuth'

import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
// import CommandPalette from './components/CommandPalette'

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
      path: 'agent',
      element: (
        <RequireAuth>
          <Agent />
        </RequireAuth>
      ),
    },
  ]

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider trackEvent={trackEvent}>
          <NotificationProvider>
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
      {/* <CommandPalette /> */}
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
