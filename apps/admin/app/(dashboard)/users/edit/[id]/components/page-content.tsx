'use client'

import { Role } from '@repo/database/generated/prisma/enums.js'
import { updateUser } from '@repo/shared/lib/api'
import { UserModel } from '@repo/shared'
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
import { useUser } from '@repo/ui/providers/user-provider'
import AvatarInput from '@repo/ui/components/avatar-input'

const editUserSchema = z.object({
  'user-username': z.string().min(1, 'Username is required'),
  'user-role': z.nativeEnum(Role, { required_error: 'Role is required' }),
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
    name: 'user-role',
    label: 'Role',
    placeholder: 'Select role',
    type: 'select',
    required: true,
    options: [
      { label: 'User', value: Role.USER },
      { label: 'Admin', value: Role.ADMIN },
      { label: 'Super Admin', value: Role.SUPER_ADMIN },
    ],
  },
  {
    name: 'user-color',
    label: 'Color',
    type: 'color',
    placeholder: 'Select color',
    required: true,
  },
]

type PageContentProps = {
  user: UserModel | null
}

export default function PageContent({ user }: PageContentProps) {
  const { user: currentUser } = useUser()
  const { showToast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [avatar, setAvatar] = useState<File | string | null>(
    user?.avatar || null
  )

  const defaultValues: EditUserFormValues = {
    'user-username': user?.username || '',
    'user-role': user?.role || Role.USER,
    'user-color': user?.color || '#000000',
  }

  const handleSubmit = async (data: EditUserFormValues) => {
    setLoading(true)
    try {
      if (
        data['user-role'] === Role.SUPER_ADMIN &&
        currentUser?.role !== Role.SUPER_ADMIN
      ) {
        showToast(
          'Only super admins can create super admin accounts',
          ToastType.ERROR
        )
        return
      }

      const response = await updateUser({
        id: user?.id || '',
        data: {
          username: data['user-username'],
          role: data['user-role'],
          color: data['user-color'],
          avatar: typeof avatar === 'string' ? undefined : avatar,
        },
      })

      if (response.success) {
        router.push('/users')
        showToast('User created successfully', ToastType.SUCCESS)
      } else {
        console.error('Failed to create user', response.error)
        showToast('Failed to create user', ToastType.ERROR)
      }
    } catch (error) {
      console.error(error)
      showToast('Failed to create user', ToastType.ERROR)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container as="main" className="py-10">
      <PageHero
        title="Edit user"
        description="Edit the user's information"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Users', href: '/users' },
          { label: 'Edit User', href: `/users/edit/${user?.id || ''}` },
        ]}
      />

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
          Update User
        </FormSubmit>
      </Form>
    </Container>
  )
}
