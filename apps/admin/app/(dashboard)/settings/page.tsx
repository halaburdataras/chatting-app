'use client'

import { useUser } from '@repo/ui/providers/user-provider'
import PageContent from './components/page-content'
import PageLoader from './components/page-loader'

export default function SettingsPage() {
  const { user, loading } = useUser()

  if (loading) {
    return <PageLoader />
  }

  return <PageContent user={user} />
}
