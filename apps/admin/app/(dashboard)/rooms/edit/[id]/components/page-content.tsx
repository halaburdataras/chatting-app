'use client'

import { updateRoom } from '@repo/shared/lib/api'
import { RoomModel } from '@repo/shared'
import { cn } from '@repo/shared/utils'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { z } from 'zod'
import Container from '@repo/ui/components/container'
import { Form, FormField, FormSubmit } from '@repo/ui/components/form'
import PageHero from '@repo/ui/components/page-hero'
import PageSection from '@repo/ui/components/page-section'
import { useToast } from '@repo/ui/providers/toast-provider'
import { ToastType } from '@repo/ui/types/index'
import AvatarInput from '@repo/ui/components/avatar-input'

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
  const [avatar, setAvatar] = useState<File | string | null>(
    room?.avatar || null
  )

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
          avatar: typeof avatar === 'string' ? undefined : avatar,
        },
      })

      if (response.success) {
        router.push('/rooms')
        showToast('Room updated successfully', ToastType.SUCCESS)
      } else {
        console.error('Failed to update room', response.error)
        showToast('Failed to update room', ToastType.ERROR)
      }
    } catch (error) {
      console.error(error)
      showToast('Failed to update room', ToastType.ERROR)
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
        <PageSection
          title="Room image"
          description="This image will be displayed for the room"
        >
          <AvatarInput
            initialImage={avatar}
            onImageChange={setAvatar}
            fallbackImage="/images/room-empty-avatar.svg"
          />
        </PageSection>
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
