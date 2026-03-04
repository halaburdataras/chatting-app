import { ChatProvider } from '~providers/chat/chat-context'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ChatProvider>{children}</ChatProvider>
}
