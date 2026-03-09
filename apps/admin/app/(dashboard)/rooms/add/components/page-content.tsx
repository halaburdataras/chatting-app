'use client'

import { createRoom } from '@repo/shared/lib/api'
import { cn } from '@repo/shared/utils'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { z } from 'zod'
import Container from '@repo/ui/components/container'
import { Form, FormField, FormSubmit } from '@repo/ui/components/form'
import PageHero from '~components/page-hero'
import PageSection from '~components/page-section'
import { useToast } from '@repo/ui/providers/toast-provider'
import { ToastType } from '@repo/ui/types/index'
import AvatarInput from '@repo/ui/components/avatar-input'

const addRoomSchema = z.object({
  'room-name': z.string().min(1, 'Room name is required'),
})

type AddRoomFormValues = z.infer<typeof addRoomSchema>

const defaultValues: AddRoomFormValues = {
  'room-name': '',
}

const INFO_FIELDS = [
  {
    name: 'room-name',
    label: 'Room name',
    type: 'text',
    placeholder: 'Enter room name',
    required: true,
  },
]

export default function PageContent() {
  const { showToast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [avatar, setAvatar] = useState<File | null>(null)

  const handleSubmit = async (data: AddRoomFormValues) => {
    setLoading(true)
    try {
      const response = await createRoom({
        data: {
          name: data['room-name'],
          avatar: avatar ?? null,
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
        title="Add new room"
        description="Add a new room to the system"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Rooms', href: '/rooms' },
          { label: 'Add Room', href: '/rooms/add' },
        ]}
      />

      <Form<AddRoomFormValues>
        schema={addRoomSchema}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        className={cn('mt-4 w-full')}
      >
        <PageSection
          title="Room image"
          description="This image will be displayed for the room"
        >
          <AvatarInput initialImage={avatar} onImageChange={setAvatar} fallbackImage="/images/room-empty-avatar.svg" />
        </PageSection>
        <PageSection title="Room information">
          {INFO_FIELDS.map((field) => (
            <FormField key={field.name} {...field} />
          ))}
        </PageSection>

        <FormSubmit className="mt-4 ml-auto" loading={loading}>
          Create Room
        </FormSubmit>
      </Form>
    </Container>
  )
}
