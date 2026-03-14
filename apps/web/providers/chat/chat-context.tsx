'use client'

import { useCallback, useContext, useEffect, useMemo, useRef } from 'react'

import { MessageModel, PaginatedResponse, RoomModel } from '@repo/shared'
import { createContext, useState } from 'react'
import {
  createMessage,
  getPaginatedMessages,
  getPaginatedRooms,
} from '@repo/shared/lib/api'
import { useToast } from '@repo/ui/providers/toast-provider'
import { ToastType } from '@repo/ui/types/index'
import useDebounce from '@repo/ui/hooks/use-debounce'
import { formatDateToDay } from '@repo/shared/utils'

import groupBy from 'lodash/groupBy'
import orderBy from 'lodash/orderBy'
import mapValues from 'lodash/mapValues'
import { useSocket } from '@repo/ui/providers/socket-context'
import useChatUsers from './use-chat-users'

const MESSAGES_PAGE_SIZE = 20

const DEFAULT_MESSAGES_PAGINATION_OPTIONS = {
  page: 1,
  pageSize: MESSAGES_PAGE_SIZE,
  total: 0,
  totalPages: 0,
}

export type ChatContextType = {
  rooms: RoomModel[]
  currentRoom: RoomModel | null
  loadingRooms: boolean
  loadingMessages: boolean
  sendMessageLoading: boolean
  sendMessage: () => void
  setCurrentRoom: (room: RoomModel) => void
  handleSelectRoom: (room: RoomModel) => void
  roomSearch: string
  setRoomSearch: (search: string) => void
  messageText: string
  setMessageText: (text: string) => void
  messages: MessageModel[]
  parsedMessageHtml: string
  messagesListRef: React.RefObject<HTMLDivElement | null>
  hasMoreMessages: boolean
  loadMoreMessages: () => void
  fetchRoomMessages: (
    roomId: string,
    page?: number,
    pageSize?: number,
    search?: string
  ) => Promise<PaginatedResponse<MessageModel> | null> | null
  messagesGroupedByDay: Record<string, MessageModel[]>
  attachments: File[]
  setAttachments: (attachments: File[]) => void
}

export const ChatContext = createContext<ChatContextType>({
  rooms: [],
  currentRoom: null,
  loadingRooms: true,
  loadingMessages: true,
  sendMessageLoading: false,
  sendMessage: () => {},
  setCurrentRoom: () => {},
  handleSelectRoom: () => {},
  fetchRoomMessages: async () => null,
  roomSearch: '',
  setRoomSearch: () => {},
  messageText: '',
  setMessageText: () => {},
  parsedMessageHtml: '',
  messages: [],
  messagesListRef: { current: null },
  hasMoreMessages: false,
  loadMoreMessages: () => {},
  messagesGroupedByDay: {},
  attachments: [],
  setAttachments: () => {},
})

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { showToast } = useToast()
  const { socket } = useSocket()
  const messagesListRef = useRef<HTMLDivElement>(null)

  // users state
  const {
    users,
    usersSearch,
    setUsersSearch,
    usersPaginationOptions,
    setUsersPaginationOptions,
    loadingUsers,
    filteredUsers,
  } = useChatUsers()

  //   Rooms state
  const [rooms, setRooms] = useState<RoomModel[]>([])
  const [loadingRooms, setLoadingRooms] = useState<boolean>(true)
  const [roomSearch, setRoomSearch] = useState<string>('')
  const roomSearchDebounced = useDebounce(roomSearch, 500)
  const [currentRoom, setCurrentRoom] = useState<RoomModel | null>(null)

  //   Input state
  const [messageText, setMessageText] = useState<string>('')
  const [sendMessageLoading, setSendMessageLoading] = useState<boolean>(false)
  const [attachments, setAttachments] = useState<File[]>([])

  //   Messages state
  const [messages, setMessages] = useState<MessageModel[]>([])
  const [loadingMessages, setLoadingMessages] = useState<boolean>(true)
  const [messagesPaginationOptions, setMessagesPaginationOptions] = useState<{
    page: number
    pageSize: number
    total: number
    totalPages: number
  }>(DEFAULT_MESSAGES_PAGINATION_OPTIONS)

  const parsedMessageHtml = useMemo(() => {
    // find tags @user and replace with <span class="text-primary">username</span>
    const usernameRegex = /@(\w+)/g
    const messageWithTags = messageText.replace(
      usernameRegex,
      `<span class="user-tag" data-username="$1">@$1</span>`
    )

    const messagesWithNewLines = messageWithTags.replace(/\n/g, '<br />')

    return messagesWithNewLines
  }, [messageText])

  const messagesGroupedByDay = useMemo(() => {
    const sortedMessages = orderBy(messages, 'createdAt', 'asc')

    const groupedMessages = groupBy(sortedMessages, (message: MessageModel) => {
      return formatDateToDay(message.createdAt)
    })

    return mapValues(groupedMessages, (messages: MessageModel[]) => {
      return orderBy(messages, 'createdAt', 'asc')
    })
  }, [messages])

  const fetchRooms = useCallback(
    async (page = 1, pageSize = 10, search = '', withLastMessage = false) => {
      setLoadingRooms(true)
      try {
        const response = await getPaginatedRooms({
          page,
          pageSize,
          search,
          withLastMessage,
        })
        if (response.success && response.data) {
          return response.data.items
        }
        return []
      } catch (error) {
        console.error(error)
        showToast('An error occurred while fetching rooms', ToastType.ERROR)
        return []
      } finally {
        setLoadingRooms(false)
      }
    },
    [showToast]
  )

  const fetchRoomMessages = useCallback(
    async (
      roomId: string,
      page = 1,
      pageSize = MESSAGES_PAGE_SIZE,
      search = ''
    ) => {
      setLoadingMessages(true)
      try {
        const response = await getPaginatedMessages({
          roomId,
          page,
          pageSize,
          search,
        })

        if (response.success && response.data) {
          return response.data
        }

        return null
      } catch (error) {
        console.error(error)
        showToast(
          'An error occurred while fetching room messages',
          ToastType.ERROR
        )
        return null
      } finally {
        setLoadingMessages(false)
      }
    },
    [showToast]
  )

  const hasMoreMessages = useMemo(() => {
    return (
      !!messagesPaginationOptions.totalPages &&
      messagesPaginationOptions.page < messagesPaginationOptions.totalPages
    )
  }, [messagesPaginationOptions])

  const loadMoreMessages = useCallback(async () => {
    const newMessagesData = await fetchRoomMessages(
      currentRoom?.id || '',
      messagesPaginationOptions.page + 1,
      messagesPaginationOptions.pageSize
    )

    if (newMessagesData) {
      setMessages((prevMessages) => [...prevMessages, ...newMessagesData.items])
      setMessagesPaginationOptions({
        page: newMessagesData.page,
        pageSize: newMessagesData.pageSize,
        total: newMessagesData.total,
        totalPages: newMessagesData.totalPages,
      })
    }
  }, [currentRoom, fetchRoomMessages, messagesPaginationOptions])

  const handleSelectRoom = useCallback(
    async (room: RoomModel) => {
      setMessages([])

      if (currentRoom) {
        socket?.emit('leaveRoom', currentRoom.id)
      }

      setCurrentRoom(room)

      socket?.emit('joinRoom', room.id)

      const initialMessagesData = await fetchRoomMessages(room.id)

      if (!initialMessagesData) return

      setMessages(initialMessagesData.items)
      setMessagesPaginationOptions({
        page: initialMessagesData.page,
        pageSize: initialMessagesData.pageSize,
        total: initialMessagesData.total,
        totalPages: initialMessagesData.totalPages,
      })

      setTimeout(() => {
        if (messagesListRef.current) {
          messagesListRef.current.scrollTop =
            messagesListRef.current.scrollHeight
        }
      }, 100)
    },
    [currentRoom, fetchRoomMessages, socket]
  )

  const sendMessage = useCallback(async () => {
    setSendMessageLoading(true)

    try {
      const response = await createMessage({
        data: {
          content: messageText,
          roomId: currentRoom?.id || '',
          attachments,
        },
      })

      if (response.success && response.data?.message) {
        const newMessage = response.data?.message as MessageModel

        socket?.emit('message', {
          roomId: currentRoom?.id || '',
          message: newMessage,
        })

        setMessageText('')
        setAttachments([])
        setMessages((prevMessages) => [...prevMessages, newMessage])

        setTimeout(() => {
          if (messagesListRef.current) {
            messagesListRef.current.scrollTop =
              messagesListRef.current.scrollHeight
          }
        }, 10)
      }
    } catch (error) {
      console.error(error)
      showToast('An error occurred while sending message', ToastType.ERROR)
    } finally {
      setSendMessageLoading(false)
    }
  }, [attachments, currentRoom, messageText, socket, showToast])

  useEffect(() => {
    const initialRoomsLoad = async () => {
      const initialRooms = await fetchRooms(1, 10, roomSearchDebounced, true)
      setRooms(initialRooms)
    }
    initialRoomsLoad()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomSearchDebounced])

  useEffect(() => {
    if (socket) {
      socket.on('message', (message: MessageModel) => {
        setMessages((prevMessages) => [...prevMessages, message])

        if(rooms.some(room => room.id === message.roomId)) {
          setRooms(prevRooms => prevRooms.map(room => room.id === message.roomId ? { ...room, messages: [ message] } : room))
        }
      })
    }
  }, [rooms, socket])

  useEffect(() => {
    // Clear room selection if esc is pressed
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setCurrentRoom(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const values = useMemo(
    () => ({
      rooms,
      currentRoom,
      setCurrentRoom,
      roomSearch,
      setRoomSearch,
      handleSelectRoom,
      fetchRoomMessages,
      hasMoreMessages,
      loadMoreMessages,
      messageText,
      messages,
      setMessageText,
      parsedMessageHtml,
      messagesListRef,
      loadingRooms,
      loadingMessages,
      sendMessageLoading,
      sendMessage,
      messagesGroupedByDay,
      attachments,
      setAttachments,
    }),
    [
      rooms,
      currentRoom,
      setCurrentRoom,
      roomSearch,
      setRoomSearch,
      handleSelectRoom,
      fetchRoomMessages,
      messageText,
      messages,
      setMessageText,
      parsedMessageHtml,
      hasMoreMessages,
      loadMoreMessages,
      loadingRooms,
      loadingMessages,
      sendMessageLoading,
      sendMessage,
      messagesGroupedByDay,
      attachments,
      setAttachments,
    ]
  )

  return <ChatContext.Provider value={values}>{children}</ChatContext.Provider>
}

export const useChat = () => {
  if (!ChatContext) {
    throw new Error('useChat must be used within a ChatProvider')
  }

  return useContext(ChatContext)
}
