import { createContext } from 'react'

interface AuthContextType {
  apiToken?: string
  signin: (token: string, from: string) => Promise<void>
  signout: () => void
}

const AuthContext = createContext<AuthContextType>(null!)

export default AuthContext
