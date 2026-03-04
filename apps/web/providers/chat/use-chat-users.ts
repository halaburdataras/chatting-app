import { UserModel } from '@repo/shared'
import useDebounce from '@repo/ui/hooks/use-debounce'
import { useMemo, useState } from 'react'

const USERS_PAGE_SIZE = 20
const DEFAULT_USERS_PAGINATION_OPTIONS = {
  page: 1,
  pageSize: USERS_PAGE_SIZE,
  total: 0,
  totalPages: 0,
}

export default function useChatUsers() {
  const [users, setUsers] = useState<UserModel[]>([])
  const [usersSearch, setUsersSearch] = useState<string>('')
  const usersSearchDebounced = useDebounce(usersSearch, 500)
  const [usersPaginationOptions, setUsersPaginationOptions] = useState<{
    page: number
    pageSize: number
    total: number
    totalPages: number
  }>(DEFAULT_USERS_PAGINATION_OPTIONS)
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true)

  const filteredUsers = useMemo(() => {
    return []
  }, [usersSearchDebounced])

  return {
    users,
    usersSearch,
    setUsersSearch,
    usersPaginationOptions,
    setUsersPaginationOptions,
    loadingUsers,
    filteredUsers,
  }
}
