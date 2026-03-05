import Button from '@repo/ui/components/button'
import IconLoading from '@repo/ui/icons/IconLoading'
import IconSend from '@repo/ui/icons/IconSend'
import IconFile from '@repo/ui/icons/IconFile'
import { useChat } from '~providers/chat/chat-context'
import { useCallback, useRef } from 'react'
import Image from 'next/image'
import IconXCircle from '@repo/ui/icons/IconXCircle'

export default function MessageInput() {
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    messageText,
    setMessageText,
    parsedMessageHtml,
    sendMessage,
    sendMessageLoading,
    attachments,
    setAttachments,
  } = useChat()

  const handleFileClick = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }, [])

  return (
    <div className="border-t border-gray-400/20 py-2.5">
      {attachments.length > 0 && (
        <div className="mb-3 overflow-x-auto pb-1">
          <div className="grid w-max grid-flow-col gap-2 px-2">
            {attachments.map((attachment) => (
              <div key={attachment.name} className="group relative">
                <Image
                  key={attachment.name}
                  src={URL.createObjectURL(attachment)}
                  alt={attachment.name}
                  width={100}
                  height={100}
                  className="aspect-square rounded-md object-cover"
                />
                <button
                  type="button"
                  className="absolute top-1 right-1 cursor-pointer rounded-full bg-white/80 opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:opacity-70"
                  onClick={() =>
                    setAttachments(
                      attachments.filter((a) => a.name !== attachment.name)
                    )
                  }
                  aria-label={`Remove attachment ${attachment.name}`}
                >
                  <IconXCircle className="size-6 min-w-6 text-gray-900/80" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 px-2">
        <Button
          variant="icon"
          area-label="Attach a file"
          onClick={handleFileClick}
        >
          <IconFile className="size-5 min-w-5" />
          <input
            type="file"
            multiple
            onChange={(e) => setAttachments(Array.from(e.target.files || []))}
            className="hidden"
            hidden
            ref={inputRef}
          />
        </Button>
        <div
          className="inline-grid flex-1 items-center before:invisible before:min-h-5.5 before:w-full before:overflow-hidden before:wrap-break-word before:whitespace-pre-line before:content-[attr(data-input)] before:[grid-area:1/1]"
          data-input={messageText + '.'}
        >
          <textarea
            name="message"
            placeholder="Type your message here..."
            className="h-full min-h-5.5 w-full resize-none overflow-hidden wrap-break-word outline-none [grid-area:1/1] focus:ring-0 focus:outline-none"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            rows={1}
          />
        </div>
        <Button
          variant="icon"
          type="submit"
          area-label="Send message"
          onClick={sendMessage}
          disabled={
            (!messageText.trim() && !attachments.length) || sendMessageLoading
          }
        >
          {sendMessageLoading ? (
            <IconLoading className="size-5 min-w-5 animate-spin" />
          ) : (
            <IconSend className="size-5 min-w-5" />
          )}
        </Button>
      </div>
    </div>
  )
}
