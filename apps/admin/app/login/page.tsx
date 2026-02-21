'use client'

import Form from '~components/form'

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

    const handleSubmit = (data: any) => {
        console.log(data)
    }

  return (
    <main className="grid min-h-screen content-center justify-items-center p-24">
      <h1 className="text-center text-2xl font-bold mb-6">Sign in to chatting app admin</h1>
      <Form fields={FIELDS} btnLabel="Sign in" onSubmit={handleSubmit} />
    </main>
  )
}
