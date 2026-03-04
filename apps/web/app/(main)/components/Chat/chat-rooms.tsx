import { cn } from '@repo/shared/utils'
import { useChat } from '~providers/chat/chat-context'
import SearchInput from '@repo/ui/components/search-input'
import Button from '@repo/ui/components/button'
import Skeleton from '@repo/ui/components/skeleton'

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
              <div key={room.id}>
                <Button
                  variant="text"
                  className={cn(
                    'text-primary w-full justify-start rounded-none px-5 py-3 text-sm font-semibold hover:bg-slate-50',
                    currentRoom?.id === room.id &&
                      'bg-slate-100 hover:bg-slate-100'
                  )}
                  onClick={() => handleSelectRoom(room)}
                >
                  {room.name}
                </Button>
              </div>
            ))}
      </div>
    </div>
  )
}
