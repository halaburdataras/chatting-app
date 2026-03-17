import { useEffect, useMemo } from 'react'
import orderBy from 'lodash/orderBy'
import groupBy from 'lodash/groupBy'
import mapValues from 'lodash/mapValues'
import { formatDateToDay } from '@repo/shared/utils'
import { useChat } from '~providers/chat/chat-context'
import ChatMessage, { ChatMessageSkeleton } from './chat-message'
import Button from '@repo/ui/components/button'
import IconLoading from '@repo/ui/icons/IconLoading'
import type { MessageModel } from '@repo/shared'

export default function MessagesList() {
  const {
    messagesListRef,
    loadingMessages,
    messages,
    messagesGroupedByDay,
    loadMoreMessages,
    hasMoreMessages,
    searchResults,
    searchResultsLoading,
    highlightedMessageId,
    registerMessageRef,
    scrollToMessageId,
  } = useChat()

  const isEmpty = messages.length === 0
  const initLoading = loadingMessages && isEmpty
  const isSearchMode = searchResults !== null

  const searchResultsGroupedByDay = useMemo(() => {
    if (!searchResults || searchResults.length === 0) return {}
    const sorted = orderBy(
      [...searchResults],
      (m) => new Date(m.createdAt).getTime(),
      'asc'
    )
    const grouped = groupBy(sorted, (m: MessageModel) =>
      formatDateToDay(m.createdAt)
    )
    return mapValues(grouped, (ms: MessageModel[]) =>
      orderBy(ms, (m) => new Date(m.createdAt).getTime(), 'asc')
    )
  }, [searchResults])

  useEffect(() => {
    if (highlightedMessageId) {
      scrollToMessageId(highlightedMessageId)
    }
  }, [highlightedMessageId, scrollToMessageId])

  return (
    <div className="flex-1 overflow-y-auto p-6" ref={messagesListRef}>
      {isSearchMode && searchResults?.length === 0 && !searchResultsLoading && (
        <div className="flex h-full items-center justify-center">
          <p className="text-secondary text-center text-sm font-medium">
            No messages found
          </p>
        </div>
      )}

      {isSearchMode &&
        searchResultsLoading &&
        Array.from({ length: 3 }).map((_, index) => (
          <ChatMessageSkeleton key={`search-skeleton-${index}`} />
        ))}

      {isSearchMode &&
        !searchResultsLoading &&
        searchResults &&
        searchResults.length > 0 &&
        Object.entries(searchResultsGroupedByDay).map(([date, dayMessages]) => (
          <div key={date} className="relative mt-4 grid">
            <p className="sticky top-0 z-1 justify-self-center rounded-[10px] bg-white/50 px-3 py-1 text-center text-xs font-medium text-black backdrop-blur-[5px]">
              {date}
            </p>
            {dayMessages.map((message, index) => (
              <ChatMessage
                ref={(el) => registerMessageRef(message.id, el)}
                message={message}
                key={message.id}
                previousMessage={index > 0 ? dayMessages[index - 1] : null}
                nextMessage={
                  index < dayMessages.length - 1 ? dayMessages[index + 1] : null
                }
                isHighlighted={highlightedMessageId === message.id}
              />
            ))}
          </div>
        ))}

      {!isSearchMode && !initLoading && !isEmpty && hasMoreMessages && (
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

      {!isSearchMode &&
        initLoading &&
        Array.from({ length: 5 }).map((_, index) => (
          <ChatMessageSkeleton key={index} />
        ))}

      {!isSearchMode && !initLoading && isEmpty && (
        <div className="flex h-full items-center justify-center">
          <p className="text-secondary text-center text-sm font-medium">
            No messages found
            <br />
            Be the first to start the conversation!
          </p>
        </div>
      )}

      {!isSearchMode &&
        !initLoading &&
        !isEmpty &&
        Object.entries(messagesGroupedByDay).map(([date, dayMessages]) => (
          <div key={date} className="relative mt-4 grid">
            <p className="sticky top-0 z-1 justify-self-center rounded-[10px] bg-white/50 px-3 py-1 text-center text-xs font-medium text-black backdrop-blur-[5px]">
              {date}
            </p>
            {dayMessages.map((message, index) => (
              <ChatMessage
                message={message}
                key={message.id}
                previousMessage={index > 0 ? dayMessages[index - 1] : null}
                nextMessage={
                  index < dayMessages.length - 1 ? dayMessages[index + 1] : null
                }
              />
            ))}
          </div>
        ))}
    </div>
  )
}
