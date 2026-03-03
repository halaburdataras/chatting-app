'use client'
import Container from '@repo/ui/components/container'
import ChatRooms from './Chat/chat-rooms'
import ChatMainArea from './Chat/chat-main-area'

export default function PageContent() {
  return (
    <Container as="main" className="py-10">
      <h1 className="text-2xl font-bold">Chat</h1>
      <section className="shadow-card mt-6 grid h-[min(100vh-148px,800px)] grid-cols-[320px_1fr]">
        <div className="border-r border-slate-400/20">
          <ChatRooms />
        </div>

        <ChatMainArea />
      </section>
    </Container>
  )
}
