'use client'

import { login, LoginRequest } from '@repo/shared/lib/api'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import Form from '~components/form'
import { setAuthToken } from '~lib/auth'
import { useUser } from '~providers/user-provider'

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
  const [error, setError] = useState<string | null>(null)
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
          setError(
            error instanceof Error
              ? error.message
              : 'An error occurred while fetching user'
          )
        }

        // Redirect to original page or home
        const redirect = searchParams.get('redirect') || '/'
        router.push(redirect)
        router.refresh()
      } else {
        setError(response.error || 'Login failed')
      }
    } catch (err) {
      setError('An error occurred during login')
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
        fields={FIELDS}
        btnLabel="Sign in"
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
      />
    </main>
  )
}
