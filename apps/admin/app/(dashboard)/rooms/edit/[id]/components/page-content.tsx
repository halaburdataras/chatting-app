'use client'

import { updateRoom } from '@repo/shared/lib/api'
import { RoomModel } from '@repo/shared'
import { cn } from '@repo/shared/utils'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { z } from 'zod'
import Container from '~components/container'
import { Form, FormField, FormSubmit } from '~components/form'
import PageHero from '~components/page-hero'
import PageSection from '~components/page-section'
import { useToast } from '~providers/toast-provider'
import { ToastType } from '~types/index'

const editRoomSchema = z.object({
  'room-name': z.string().min(1, 'Room name is required'),
})

type EditRoomFormValues = z.infer<typeof editRoomSchema>

const INFO_FIELDS = [
  {
    name: 'room-name',
    label: 'Room name',
    type: 'text',
    placeholder: 'Enter room name',
    required: true,
  },
]

type PageContentProps = {
  room: RoomModel | null
}

export default function PageContent({ room }: PageContentProps) {
  const { showToast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const defaultValues: EditRoomFormValues = {
    'room-name': room?.name || '',
  }

  const handleSubmit = async (data: EditRoomFormValues) => {
    setLoading(true)
    try {
      const response = await updateRoom({
        id: room?.id || '',
        data: {
          name: data['room-name'],
        },
      })

      if (response.success) {
        router.push('/rooms')
        showToast('Room created successfully', ToastType.SUCCESS)
      } else {
        console.error('Failed to create room', response.error)
        showToast('Failed to create room', ToastType.ERROR)
      }
    } catch (error) {
      console.error(error)
      showToast('Failed to create room', ToastType.ERROR)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container as="main" className="py-10">
      <PageHero
        title="Edit room"
        description="Edit the room's information"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Rooms', href: '/rooms' },
          { label: 'Edit Room', href: `/rooms/edit/${room?.id || ''}` },
        ]}
      />

      <Form<EditRoomFormValues>
        schema={editRoomSchema}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        className={cn('mt-4 w-full')}
      >
        <PageSection title="Room information">
          {INFO_FIELDS.map((field) => (
            <FormField key={field.name} {...field} />
          ))}
        </PageSection>

        <FormSubmit className="mt-4 ml-auto" loading={loading}>
          Update Room
        </FormSubmit>
      </Form>
    </Container>
  )
}
