import { useState } from 'react'
import Image from 'next/image'

import Button from '@repo/ui/components/button'
import { Input } from '@repo/ui/components/form'
import IconSearch from '@repo/ui/icons/IconSearch'
import IconXCircle from '@repo/ui/icons/IconXCircle'
import { cn } from '@repo/shared/utils'
import { useChat } from '~providers/chat/chat-context'
import IconChevronDown from '@repo/ui/icons/IconChevronDown'

const ROOM_AVATAR_FALLBACK = '/images/room-empty-avatar.svg'

export default function RoomHeader() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const {
    currentRoom,
    messageSearch,
    setMessageSearch,
    searchResults,
    searchResultsLoading,
    goToPreviousSearchResult,
    goToNextSearchResult,
    canGoToPreviousSearchResult,
    canGoToNextSearchResult,
  } = useChat()

  if (!currentRoom) return null

  const avatarSrc = currentRoom.avatar ?? ROOM_AVATAR_FALLBACK
  const showSearchNavigation =
    searchResults !== null && searchResults.length > 0
  const singleResult = searchResults !== null && searchResults.length === 1

  const closeSearch = () => {
    setIsSearchOpen(false)
    setMessageSearch('')
  }

  return (
    <div className="flex items-center justify-between gap-2 border-b border-slate-400/20 py-4 pr-2 pl-5">
      <div className="flex min-w-0 shrink-0 items-center gap-3">
        <Image
          src={avatarSrc}
          alt={currentRoom.name}
          width={40}
          height={40}
          className="size-10 shrink-0 rounded-full object-cover"
        />
        <p className="truncate text-sm font-semibold">{currentRoom.name}</p>
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        {!isSearchOpen ? (
          <Button
            variant="icon"
            aria-label="Search messages in room"
            onClick={() => setIsSearchOpen(true)}
          >
            <IconSearch className="size-5 min-w-5" />
          </Button>
        ) : (
          <>
            <div className="relative flex max-w-64 min-w-0 flex-1 items-center">
              <IconSearch className="pointer-events-none absolute left-3 size-5 min-w-5 text-slate-400" />
              <Input
                name="message-search"
                type="text"
                placeholder="Search messages..."
                className="w-full min-w-0 pl-9"
                value={messageSearch}
                onChange={(e) =>
                  setMessageSearch(
                    typeof e === 'string'
                      ? e
                      : ((e?.target as HTMLInputElement)?.value ?? '')
                  )
                }
                aria-label="Search messages in room"
              />
              {searchResultsLoading && (
                <span
                  className="absolute right-3 text-xs text-slate-400"
                  aria-hidden
                >
                  …
                </span>
              )}
            </div>
            {showSearchNavigation && (
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="icon"
                  aria-label="Scroll to previous search result (older)"
                  disabled={singleResult || !canGoToPreviousSearchResult}
                  onClick={goToPreviousSearchResult}
                  className={cn(
                    (singleResult || !canGoToPreviousSearchResult) &&
                      'opacity-50'
                  )}
                >
                  <IconChevronDown className="size-5 min-w-5 rotate-180" />
                </Button>
                <Button
                  variant="icon"
                  aria-label="Scroll to next search result (newer)"
                  disabled={singleResult || !canGoToNextSearchResult}
                  onClick={goToNextSearchResult}
                  className={cn(
                    (singleResult || !canGoToNextSearchResult) && 'opacity-50'
                  )}
                >
                  <IconChevronDown className="size-5 min-w-5" />
                </Button>
              </div>
            )}
            <Button
              variant="icon"
              aria-label="Close search"
              onClick={closeSearch}
            >
              <IconXCircle className="size-5 min-w-5" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
