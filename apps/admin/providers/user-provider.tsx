'use client'
import { UserModel } from '@repo/shared'
import { apiClient, getCurrentUser } from '@repo/shared/lib/api'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

export default function UserProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<UserModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getCurrentUser()
      if (response.success && response.data) {
        setUser(response.data.user)
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'An error occurred while fetching user'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (apiClient.isAuthenticated()) {
      fetchUser()
    }
  }, [fetchUser])

  const values = useMemo(
    () => ({ user, loading, error, setUser, setLoading, setError, fetchUser }),
    [user, loading, error, fetchUser]
  )

  return <UserContext.Provider value={values}>{children}</UserContext.Provider>
}

const UserContext = createContext<{
  user: UserModel | null
  loading: boolean
  error: string | null
  setUser: (user: UserModel) => void
  setLoading: (loading: boolean) => void
  setError: (error: string) => void
  fetchUser: () => Promise<void>
}>({
  user: null,
  loading: false,
  error: null,
  setUser: () => {},
  setLoading: () => {},
  setError: () => {},
  fetchUser: async () => {},
})

export function useUser() {
  return useContext(UserContext)
}
