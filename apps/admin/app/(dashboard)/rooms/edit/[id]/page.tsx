'use client'

import { getRoom } from '@repo/shared/lib/api'
import PageContent from './components/page-content'
import React, { useEffect, useState } from 'react'
import { RoomModel } from '@repo/shared'
import { useToast } from '~providers/toast-provider'
import { ToastType } from '~types/index'
import PageLoader from './components/page-loader'

type EditRoomPageProps = {
  params: Promise<{
    id: string
  }>
}

export default function EditRoomPage({ params }: EditRoomPageProps) {
  const { id } = React.use(params)

  const [room, setRoom] = useState<RoomModel | null>(null)
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await getRoom({ id })
        if (response.success && response.data) {
          setRoom(response.data.room)
        }
      } catch (error) {
        console.error(error)
        showToast('Failed to fetch room', ToastType.ERROR)
      } finally {
        setLoading(false)
      }
    }

    fetchRoom()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loading) {
    return <PageLoader id={id} />
  }

  return <PageContent room={room} />
}
