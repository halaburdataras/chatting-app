'use client'

import { login, LoginRequest } from '@repo/shared/lib/api'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { z } from 'zod'
import Form, { FormField, FormSubmit } from '~components/form'
import { setAuthToken } from '~lib/auth'
import { useToast } from '~providers/toast-provider'
import { useUser } from '~providers/user-provider'
import { ToastType } from '~types/index'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const defaultValues: LoginFormValues = {
  email: '',
  password: '',
}

const FIELDS = [
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: true,
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    required: true,
  },
]

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}

const LoginForm = () => {
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()
  const searchParams = useSearchParams()
  const { fetchUser } = useUser()
  const router = useRouter()

  const handleSubmit = async (data: LoginRequest) => {
    setLoading(true)
    try {
      const response = await login(data)

      if (response.success && response.data) {
        setAuthToken(response.data.token)

        try {
          await fetchUser()
        } catch (error) {
          showToast(
            error instanceof Error
              ? error.message
              : 'An error occurred while fetching user',
            ToastType.ERROR
          )
        }

        // Redirect to original page or home
        const redirect = searchParams.get('redirect') || '/'
        router.push(redirect)
        router.refresh()
      } else {
        showToast(response.error || 'Login failed', ToastType.ERROR)
      }
    } catch (err) {
      showToast('An error occurred during login', ToastType.ERROR)
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-screen content-center justify-items-center p-24">
      <h1 className="mb-6 text-center text-2xl font-bold">
        Sign in to chatting app admin
      </h1>
      <Form
        schema={loginSchema}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
      >
        {FIELDS.map((field) => (
          <FormField key={field.name} {...field} />
        ))}
        <FormSubmit className="mt-4 w-full" loading={loading}>
          Sign in
        </FormSubmit>
      </Form>
    </main>
  )
}
