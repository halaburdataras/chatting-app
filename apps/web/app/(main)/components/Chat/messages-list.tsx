import { useChat } from '~providers/chat-context'
import ChatMessage, { ChatMessageSkeleton } from './chat-message'
import Button from '@repo/ui/components/button'
import IconLoading from '@repo/ui/icons/IconLoading'

export default function MessagesList() {
  const {
    messagesListRef,
    loadingMessages,
    messages,
    messagesGroupedByDay,
    loadMoreMessages,
    hasMoreMessages,
  } = useChat()

  const isEmpty = messages.length === 0
  const initLoading = loadingMessages && isEmpty

  return (
    <div className="flex-1 overflow-y-auto p-6" ref={messagesListRef}>
      {!initLoading && !isEmpty && hasMoreMessages && (
        <Button
          variant="text"
          onClick={loadMoreMessages}
          className="mx-auto mb-4 px-2 py-1"
          disabled={loadingMessages}
        >
          {loadingMessages ? (
            <IconLoading className="size-4 min-w-4 animate-spin" />
          ) : (
            'Load more messages'
          )}
        </Button>
      )}

      {initLoading &&
        Array.from({ length: 5 }).map((_, index) => (
          <ChatMessageSkeleton key={index} />
        ))}

      {!initLoading && isEmpty && (
        <div className="flex h-full items-center justify-center">
          <p className="text-secondary text-center text-sm font-medium">
            No messages found
            <br />
            Be the first to start the conversation!
          </p>
        </div>
      )}

      {!initLoading &&
        !isEmpty &&
        Object.entries(messagesGroupedByDay).map(([date, messages]) => (
          <div key={date}>
            <p className="text-center text-xs font-medium text-slate-400">
              {date}
            </p>
            {messages.map((message, index) => (
              <ChatMessage
                message={message}
                key={message.id}
                previousMessage={index > 0 ? messages[index - 1] : null}
                nextMessage={
                  index < messages.length - 1 ? messages[index + 1] : null
                }
              />
            ))}
          </div>
        ))}
    </div>
  )
}
