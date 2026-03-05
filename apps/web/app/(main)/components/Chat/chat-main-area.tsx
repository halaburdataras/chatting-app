import { useChat } from '~providers/chat/chat-context'
import MessageInput from './message-input'
import RoomHeader from './room-header'
import MessagesList from './messages-list'

export default function ChatMainArea() {
  const { currentRoom } = useChat()

  return (
    <div className="flex h-full overflow-hidden">
      {!currentRoom ? (
        <EmptyState />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <RoomHeader />
          <MessagesList />
          <MessageInput />
        </div>
      )}
    </div>
  )
}

const EmptyState = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <p className="text-secondary text-sm font-medium">
        Select a room to start chatting
      </p>
    </div>
  )
}
