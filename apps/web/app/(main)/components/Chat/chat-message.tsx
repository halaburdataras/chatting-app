import { MessageModel } from '@repo/shared'
import { cn, formatDateToLocalTime } from '@repo/shared/utils'
import Skeleton from '@repo/ui/components/skeleton'
import { useUser } from '@repo/ui/providers/user-provider'
import Image from 'next/image'

type ChatMessageProps = {
  message: MessageModel
  previousMessage: MessageModel | null | undefined
  nextMessage: MessageModel | null | undefined
}

export default function ChatMessage({
  message,
  previousMessage,
  nextMessage,
}: ChatMessageProps) {
  const { user: currentUser } = useUser()

  const isCurrentUser = currentUser?.id === message.userId

  const username = message.user?.username

  const isFirstPerUser =
    previousMessage?.userId !== message.userId &&
    nextMessage?.userId === message.userId
  const isLastPerUser =
    previousMessage?.userId === message.userId &&
    nextMessage?.userId !== message.userId
  const isMiddlePerUser =
    previousMessage?.userId === message.userId &&
    nextMessage?.userId === message.userId

  return (
    <div
      className={cn(
        'flex items-start gap-4 not-first:mt-4',
        isCurrentUser && 'flex-row-reverse',
        (isMiddlePerUser || isLastPerUser) && 'not-first:mt-1'
      )}
    >
      <div
        className={cn(
          'flex size-8 items-center justify-center rounded-full',
          isCurrentUser ? 'bg-emerald-100' : 'bg-gray-100',
          (isMiddlePerUser || isLastPerUser) && 'opacity-0'
        )}
      >
        <p className="text-sm font-semibold">
          {username?.charAt(0).toUpperCase() || 'A'}
        </p>
      </div>

      <div
        className={cn(
          'flex flex-col items-start',
          isCurrentUser && 'items-end'
        )}
      >
        <div
          className={cn(
            'mb-2 flex items-center gap-2',
            isCurrentUser && 'flex-row-reverse',
            (isMiddlePerUser || isLastPerUser) && 'hidden'
          )}
        >
          <p
            className="max-w-28 truncate text-sm font-semibold"
            title={username}
          >
            {username}
          </p>
          <span className="leading-0 text-slate-400">•</span>
          <p className="text-xs text-slate-400">
            {formatDateToLocalTime(message.createdAt)}
          </p>
        </div>

        <div
          className={cn(
            'rounded-lg bg-gray-100 p-3 text-sm whitespace-pre-line',
            isCurrentUser && 'bg-emerald-100',
            isMiddlePerUser && isCurrentUser && 'rounded-r-sm',
            isMiddlePerUser && !isCurrentUser && 'rounded-l-sm',
            isLastPerUser && isCurrentUser && 'rounded-tr-sm',
            isLastPerUser && !isCurrentUser && 'rounded-tl-sm',
            isFirstPerUser && isCurrentUser && 'rounded-br-sm',
            isFirstPerUser && !isCurrentUser && 'rounded-bl-sm'
          )}
        >
          {!!message.content && (
            <div dangerouslySetInnerHTML={{ __html: message.content || '' }} />
          )}

          {!!message.attachments.length && (
            <div
              className={cn(
                'flex flex-wrap gap-2',
                !!message.content && 'mt-2'
              )}
            >
              {message.attachments.map((attachment) => (
                <Image
                  key={attachment}
                  src={attachment}
                  alt="Attachment"
                  width={245}
                  height={245}
                  className="rounded-md object-cover"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function ChatMessageSkeleton() {
  return (
    <div className="flex w-full max-w-[300px] items-start gap-4 not-first:mt-4">
      <div className="flex items-start gap-4">
        <div>
          <Skeleton className="size-8 rounded-full" />
        </div>
      </div>
      <div className="flex w-full flex-col">
        <Skeleton className="h-4 w-2/4" />
        <Skeleton className="mt-2 h-14 w-full rounded-lg bg-gray-100" />
      </div>
    </div>
  )
}
