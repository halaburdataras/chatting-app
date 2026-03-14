import Image from 'next/image'
import { cn } from '@repo/shared/utils'
import { formatRelativeTime } from '@repo/shared/utils'
import { useChat } from '~providers/chat/chat-context'
import SearchInput from '@repo/ui/components/search-input'
import Button from '@repo/ui/components/button'
import Skeleton from '@repo/ui/components/skeleton'
import { RoomModel } from '@repo/shared'
import type { MessageModel } from '@repo/shared'

const PREVIEW_TEXT_MAX_LENGTH = 35

export default function ChatRooms() {
  const {
    rooms,
    currentRoom,
    handleSelectRoom,
    roomSearch,
    setRoomSearch,
    loadingRooms,
  } = useChat()

  return (
    <div>
      <div className="px-5 pt-5 pb-2">
        <SearchInput
          name="rooms"
          placeholder="Search rooms..."
          value={roomSearch || ''}
          onChange={(value) => setRoomSearch(value)}
          className="w-full"
        />
      </div>
      <div className="grid">
        {loadingRooms
          ? Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="px-5 not-first:mt-1">
                <Skeleton className="h-10 w-full rounded-none" />
              </div>
            ))
          : rooms.map((room) => (
              <ChatRoomItem
                key={room.id}
                room={room}
                currentRoom={currentRoom}
                handleSelectRoom={handleSelectRoom}
              />
            ))}
      </div>
    </div>
  )
}

type ChatRoomItemProps = {
  room: RoomModel
  currentRoom: RoomModel | null
  handleSelectRoom: (room: RoomModel) => void
}

function ChatRoomItem({
  room,
  currentRoom,
  handleSelectRoom,
}: ChatRoomItemProps) {
  const lastMessage = room.messages?.[0] ?? null
  const isActive = currentRoom?.id === room.id

  return (
    <div>
      <Button
        variant="text"
        className={cn(
          'text-primary w-full text-start justify-start rounded-none px-5 py-3 text-sm font-semibold hover:bg-slate-50',
          isActive && 'bg-slate-100 hover:bg-slate-100'
        )}
        onClick={() => handleSelectRoom(room)}
      >
        <span>
          <Image
            src={room.avatar || '/images/room-empty-avatar.svg'}
            alt={room.name}
            width={40}
            height={40}
            className="rounded-full object-cover size-10 shrink-0"
          />
        </span>
        <span className="grid gap-0.5 min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="text-base font-semibold truncate">{room.name}</span>
            {lastMessage && (
              <span className="text-xs text-gray-400 shrink-0">
                {formatRelativeTime(lastMessage.createdAt)}
              </span>
            )}
          </span>
          {lastMessage ? (
            <LastMessagePreview message={lastMessage} />
          ) : (
            <span className="text-sm font-normal text-gray-400">
              No messages yet
            </span>
          )}
        </span>
      </Button>
    </div>
  )
}

/** Renders last message author and content/attachment snippet for room list preview */
function LastMessagePreview({ message }: { message: MessageModel }) {
  const { user, content, attachments } = message
  const firstAttachment =
    Array.isArray(attachments) && attachments.length > 0 ? attachments[0] : null
  const previewText =
    content && content.length > 0
      ? content.length <= PREVIEW_TEXT_MAX_LENGTH
        ? content
        : `${content.slice(0, PREVIEW_TEXT_MAX_LENGTH)}…`
      : null

  return (
    <span className="flex items-center gap-2 text-sm text-gray-500 min-w-0">
      {/* Author avatar or initial */}
      <span className="shrink-0 flex items-center justify-center size-4 rounded-full overflow-hidden bg-slate-200">
        {user?.avatar ? (
          <Image
            src={user.avatar}
            alt={user?.username ?? ''}
            width={16}
            height={16}
            className="rounded-full object-cover size-4"
          />
        ) : (
          <span className="text-[10px] font-semibold text-gray-600">
            {user?.username?.charAt(0).toUpperCase() ?? '?'}
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1 flex items-center gap-1 truncate">
        <span className="font-semibold text-gray-700 truncate shrink-0 max-w-[60px]">
          {user?.username ?? 'Unknown'}
        </span>
        {firstAttachment && (
          <Image
            src={firstAttachment}
            alt="Attachment"
            width={16}
            height={16}
            className="rounded-md object-cover size-4 shrink-0"
          />
        )}
        {previewText && (
          <span className="text-gray-400 truncate">{previewText}</span>
        )}
      </span>
    </span>
  )
}
