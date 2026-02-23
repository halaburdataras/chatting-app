'use client'

import { Role } from '@repo/database/generated/prisma/enums.js'
import { createUser, updateUser } from '@repo/shared/lib/api'
import { UserModel } from '@repo/shared'
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
import { useUser } from '~providers/user-provider'

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
        className={cn('w-full')}
      >
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
