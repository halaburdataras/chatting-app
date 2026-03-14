import Image from 'next/image'
import { cn } from '@repo/shared/utils'
import { useChat } from '~providers/chat/chat-context'
import SearchInput from '@repo/ui/components/search-input'
import Button from '@repo/ui/components/button'
import Skeleton from '@repo/ui/components/skeleton'
import { RoomModel } from '@repo/shared'

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
              <ChatRoomItem key={room.id} room={room} currentRoom={currentRoom} handleSelectRoom={handleSelectRoom} />
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

const ChatRoomItem = ({ room, currentRoom, handleSelectRoom }: ChatRoomItemProps) => {
const firstMessage = room.messages[0]

  return (
    <div key={room.id}>
                <Button
                  variant="text"
                  className={cn(
                    'text-primary w-full text-start justify-start rounded-none px-5 py-3 text-sm font-semibold hover:bg-slate-50',
                    currentRoom?.id === room.id &&
                      'bg-slate-100 hover:bg-slate-100'
                  )}
                  onClick={() => handleSelectRoom(room)}
                >
                  <span>

                    <Image src={room.avatar || '/images/room-empty-avatar.svg'} alt={room.name} width={40} height={40} className="rounded-full object-cover size-10 shrink-0" />
                  </span>
                  <span className="grid gap-0.5">

                  <span className="text-base font-semibold">
                  {room.name}
                  </span>
                  {firstMessage ? <span className="flex gap-2">
<span>
  {firstMessage?.user?.avatar ? <Image src={firstMessage?.user?.avatar} alt={firstMessage?.user?.username} width={16} height={16} className="rounded-full object-cover size-4 shrink-0" /> : <span className="text-sm font-semibold">{firstMessage?.user?.username?.charAt(0).toUpperCase()}</span>}
</span>

<span className="text-sm font-semibold truncate max-w-[50px]">
{firstMessage?.user?.username}
</span>
<span className='flex gap-1'>
{!!firstMessage?.attachments?.length && <Image src={firstMessage?.attachments[0] || ''} alt="Attachment" width={16} height={16} className="rounded-md object-cover size-4 shrink-0" />}
{!!firstMessage?.content && <span className="text-sm font-normal font-gray-400">{firstMessage?.content?.slice(0, 20)} {firstMessage?.content?.length > 20 && '...'}</span>}
</span>


                  </span> :<span className="text-sm font-normal font-gray-400">No messages yet</span>}
                  </span>
                </Button>
              </div>
  )
}