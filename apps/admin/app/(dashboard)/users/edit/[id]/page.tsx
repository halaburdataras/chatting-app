'use client'

import { getUser } from '@repo/shared/lib/api'
import PageContent from './components/page-content'
import React, { useEffect, useState } from 'react'
import { UserModel } from '@repo/shared'
import { useToast } from '@repo/ui/providers/toast-provider'
import { ToastType } from '@repo/ui/types/index'
import PageLoader from './components/page-loader'

type EditUserPageProps = {
  params: Promise<{
    id: string
  }>
}

export default function EditUserPage({ params }: EditUserPageProps) {
  const { id } = React.use(params)

  const [user, setUser] = useState<UserModel | null>(null)
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUser({ id })
        if (response.success && response.data) {
          setUser(response.data.user)
        }
      } catch (error) {
        console.error(error)
        showToast('Failed to fetch user', ToastType.ERROR)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loading) {
    return <PageLoader id={id} />
  }

  return <PageContent user={user} />
}
