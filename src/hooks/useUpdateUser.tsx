import { useAuth } from './useAuth'
import { User } from '../types/Account'

export const useUpdateUser = () => {
  const { setUser } = useAuth()

  const updateUser = (user: Partial<User>) => {
    setUser((prev) => {
      if (!prev) {
        return
      }
      return {
        ...prev,
        ...user,
      }
    })
  }

  return updateUser
}
