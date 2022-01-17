import React from 'react'
import { useAuth } from '../App'
import { User } from '../types/User'

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
