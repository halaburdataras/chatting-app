'use client'

import { UserModel } from '@repo/shared'
import { updateUser } from '@repo/shared/lib/api'
import { cn } from '@repo/shared/utils'
import AvatarInput from '@repo/ui/components/avatar-input'
import Container from '@repo/ui/components/container'
import Form, { FormField, FormSubmit } from '@repo/ui/components/form'
import { useToast } from '@repo/ui/providers/toast-provider'
import { ToastType } from '@repo/ui/types/index'
import { useState } from 'react'
import z from 'zod'
import PageHero from '@repo/ui/components/page-hero'
import PageSection from '@repo/ui/components/page-section'
import { Role } from '@repo/database/generated/prisma/enums.js'
import { useUser } from '@repo/ui/providers/user-provider'

const editUserSchema = z.object({
  'user-username': z.string().min(1, 'Username is required'),
  'user-color': z.string().min(1, 'Color is required'),
})

type EditUserFormValues = z.infer<typeof editUserSchema>

const INFO_FIELDS = [
  {
    name: 'user-username',
    label: 'Username',
    type: 'text',
    placeholder: 'Enter username',
    required: true,
  },
  {
    name: 'user-color',
    label: 'Color',
    type: 'color',
    placeholder: 'Select color',
    required: true,
  },
]

export default function PageContent({ user }: { user: UserModel | null }) {
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()
  const [avatar, setAvatar] = useState<File | string | null>(
    user?.avatar || null
  )
  const { fetchUser } = useUser()

  const defaultValues: EditUserFormValues = {
    'user-username': user?.username || '',
    'user-color': user?.color || '#000000',
  }

  const handleSubmit = async (data: EditUserFormValues) => {
    setLoading(true)
    try {
      const response = await updateUser({
        id: user?.id || '',
        data: {
          username: data['user-username'],
          color: data['user-color'],
          role: user?.role || Role.USER,
          avatar: typeof avatar === 'string' ? undefined : avatar,
        },
      })
      if (response.success) {
        showToast('User updated successfully', ToastType.SUCCESS)
        await fetchUser()
      } else {
        showToast('Failed to update user', ToastType.ERROR)
      }
    } catch (error) {
      console.error(error)
      showToast('Failed to update user', ToastType.ERROR)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container as="main" className="py-10">
      <PageHero title="Settings" description="Manage your settings" />

      <Form<EditUserFormValues>
        schema={editUserSchema}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        className={cn('mt-4 w-full')}
      >
        <PageSection
          title="Profile image"
          description="This photo will be displayed in the chat"
        >
          <AvatarInput initialImage={avatar} onImageChange={setAvatar} />
        </PageSection>
        <PageSection title="User information">
          {INFO_FIELDS.map((field) => (
            <FormField key={field.name} {...field} />
          ))}
        </PageSection>

        <FormSubmit className="mt-4 ml-auto" loading={loading}>
          Update Current User
        </FormSubmit>
      </Form>
    </Container>
  )
}
