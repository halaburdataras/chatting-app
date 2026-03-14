import Header from '~components/header'
import { ChatProvider } from '~providers/chat/chat-context'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ChatProvider>
      <Header />
      <div className="mt-16">{children}</div>
    </ChatProvider>
  )
}
