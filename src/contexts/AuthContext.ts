import { createContext, Dispatch, SetStateAction } from 'react'
import { User } from '../types/Account'

interface AuthContextType {
  user?: User
  setUser: Dispatch<SetStateAction<User | undefined>>
  apiToken?: string
  signin: (token: string, from: string) => Promise<void>
  signout: () => void
}

const AuthContext = createContext<AuthContextType>(null!)

export default AuthContext
