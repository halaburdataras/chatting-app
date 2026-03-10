'use client'

import { useMemo } from 'react'
import UserAvatarIcon from '~icons/user-avatar.svg'
import { useUser } from '@repo/ui/providers/user-provider'
import Dropdown from '@repo/ui/components/dropdown'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function AccountPopover() {
  const { logout, user } = useUser()
  const router = useRouter()

  const list = useMemo(
    () => [
      {
        label: 'Settings',
        dividerPosition: 'top',
        onClick: () => {
          router.push('/settings')
        },
      },
      {
        label: 'Logout',
        variant: 'error',
        dividerPosition: 'top',
        onClick: () => {
          logout()
        },
      },
    ],
    [logout, router]
  )

  return (
    <Dropdown
      list={list}
      align="end"
      trigger={
        <button
          className="h-9 w-9 cursor-pointer overflow-hidden rounded-full transition-opacity duration-300 outline-none hover:opacity-80"
          aria-label="Open account options"
        >
          {user?.avatar ? (
            <Image
              src={user.avatar}
              alt="Avatar"
              width={36}
              height={36}
              className="h-full w-full object-cover"
            />
          ) : (
            <UserAvatarIcon className="size-8 min-w-8 text-slate-500" />
          )}
        </button>
      }
    >
      <div className="flex flex-col gap-0.5 p-3 pb-1">
        <p className="text-sm font-semibold">{user?.username}</p>
        <p className="text-sm text-slate-500">{user?.email}</p>
      </div>
    </Dropdown>
  )
}
