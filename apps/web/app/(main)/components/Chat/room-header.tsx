import Button from '@repo/ui/components/button'
import Dropdown from '@repo/ui/components/dropdown'
import IconDotsVertical from '@repo/ui/icons/IconDotsVertical'
import IconSearch from '@repo/ui/icons/IconSearch'
import { useChat } from '~providers/chat/chat-context'

export default function RoomHeader() {
  const { currentRoom } = useChat()

  return (
    <div className="flex items-center justify-between border-b border-slate-400/20 py-4 pr-2 pl-5">
      <p className="text-sm font-semibold">{currentRoom?.name}</p>
      <div className="flex items-center gap-2">
        <Button variant="icon" aria-label="Search messages in room">
          <IconSearch className="size-5 min-w-5" />
        </Button>
        <Dropdown
          trigger={
            <Button variant="icon" aria-label="Open room options">
              <IconDotsVertical className="size-5 min-w-5" />
            </Button>
          }
        >
          TODO: add room options
        </Dropdown>
      </div>
    </div>
  )
}
