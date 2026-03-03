import '@repo/ui/styles.css'
import './globals.css'
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import UserProvider from '@repo/ui/providers/user-provider'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Chatting App',
  description: 'Talk with your friends',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  )
}
