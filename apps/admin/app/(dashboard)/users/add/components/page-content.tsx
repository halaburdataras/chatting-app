'use client'

import { Role } from '@repo/database/generated/prisma/enums.js'
import { createUser } from '@repo/shared/lib/api'
import { cn } from '@repo/shared/utils'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { z } from 'zod'
import Container from '@repo/ui/components/container'
import { Form, FormField, FormSubmit } from '@repo/ui/components/form'
import PageHero from '~components/page-hero'
import PageSection from '~components/page-section'
import { useToast } from '@repo/ui/providers/toast-provider'
import { useUser } from '@repo/ui/providers/user-provider'
import { ToastType } from '@repo/ui/types/index'
import AvatarInput from '@repo/ui/components/avatar-input'

const addUserSchema = z.object({
  'user-username': z.string().min(1, 'Username is required'),
  'user-role': z.nativeEnum(Role, { required_error: 'Role is required' }),
  'user-color': z.string().min(1, 'Color is required'),
  'user-email': z.string().min(1, 'Email is required').email('Invalid email'),
  'user-password': z.string().min(8, 'Password must be at least 8 characters'),
})

type AddUserFormValues = z.infer<typeof addUserSchema>

const defaultValues: AddUserFormValues = {
  'user-username': '',
  'user-role': Role.USER,
  'user-color': '#000000',
  'user-email': '',
  'user-password': '',
}

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

const CREDENTIALS_FIELDS = [
  {
    name: 'user-email',
    label: 'Email',
    type: 'email',
    placeholder: 'Enter email',
    required: true,
  },
  {
    name: 'user-password',
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    required: true,
  },
]

export default function PageContent() {
  const { user } = useUser()
  const { showToast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [avatar, setAvatar] = useState<File | null>(null)

  const handleSubmit = async (data: AddUserFormValues) => {
    setLoading(true)
    try {
      if (
        data['user-role'] === Role.SUPER_ADMIN &&
        user?.role !== Role.SUPER_ADMIN
      ) {
        showToast(
          'Only super admins can create super admin accounts',
          ToastType.ERROR
        )
        return
      }

      const response = await createUser({
        data: {
          email: data['user-email'],
          username: data['user-username'],
          password: data['user-password'],
          role: data['user-role'],
          color: data['user-color'],
          avatar: avatar || null,
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
        title="Add new user"
        description="Add a new user to the system"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Users', href: '/users' },
          { label: 'Add User', href: '/users/add' },
        ]}
      />

      <Form<AddUserFormValues>
        schema={addUserSchema}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        className={cn('mt-4 w-full')}
      >
        <PageSection
          title="Profile image"
          description="This photo will be displayed in the chat"
        >
          <AvatarInput initialImage={avatar} onImageChange={setAvatar}  />
        </PageSection>
        <PageSection title="User information">
          {INFO_FIELDS.map((field) => (
            <FormField key={field.name} {...field} />
          ))}
        </PageSection>
        <PageSection title="User credentials">
          {CREDENTIALS_FIELDS.map((field) => (
            <FormField key={field.name} {...field} />
          ))}
        </PageSection>

        <FormSubmit className="mt-4 ml-auto" loading={loading}>
          Create User
        </FormSubmit>
      </Form>
    </Container>
  )
}
