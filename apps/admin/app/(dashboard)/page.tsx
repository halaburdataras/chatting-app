'use client'

import { useToast } from '~providers/toast-provider'
import { ToastType } from '~types/index'

export default function Page() {
  const { showToast } = useToast()

  return (
    <main className="text-red flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Chatting App Admin</h1>
      <button onClick={() => showToast('Success toast', ToastType.SUCCESS)}>
        Success toast
      </button>
      <button onClick={() => showToast('Error toast', ToastType.ERROR)}>
        Error toast
      </button>
      <button onClick={() => showToast('Warning toast', ToastType.WARNING)}>
        Warning toast
      </button>
      <button onClick={() => showToast('Info toast', ToastType.INFO)}>
        Info toast
      </button>
    </main>
  )
}
