import Button from '@repo/ui/components/button'
import { Input } from '@repo/ui/components/form'
import IconLoading from '@repo/ui/icons/IconLoading'
import IconSend from '@repo/ui/icons/IconSend'
import { useChat } from '~providers/chat-context'

export default function MessageInput() {
  const {
    messageText,
    setMessageText,
    parsedMessageHtml,
    sendMessage,
    sendMessageLoading,
  } = useChat()

  return (
    <div className="flex items-center gap-2 border-t border-gray-400/20 px-2 py-2.5">
      <div className="flex flex-1 items-center gap-2">
        {/* <div
          dangerouslySetInnerHTML={{ __html: parsedMessageHtml }}
          className="text-secondary text-sm font-medium"
        /> */}
        <textarea
          name="message"
          placeholder="Type your message here..."
          className="min-h-5.5 w-full resize-none outline-none focus:ring-0 focus:outline-none"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          rows={1}
        />
      </div>
      <Button
        variant="icon"
        type="submit"
        onClick={sendMessage}
        disabled={sendMessageLoading}
      >
        {sendMessageLoading ? (
          <IconLoading className="size-5 min-w-5 animate-spin" />
        ) : (
          <IconSend className="size-5 min-w-5" />
        )}
      </Button>
    </div>
  )
}
