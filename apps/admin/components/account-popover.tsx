'use client'

import { useMemo } from 'react'
import UserAvatarIcon from '~icons/user-avatar.svg'
import { useUser } from '~providers/user-provider'
import Dropdown from './dropdown'

export default function AccountPopover() {
  const { logout, user } = useUser()

  const list = useMemo(
    () => [
      {
        label: 'Logout',
        variant: 'error',
        dividerPosition: 'top',
        onClick: () => {
          logout()
        },
      },
    ],
    [logout]
  )

  return (
    <Dropdown
      list={list}
      align="end"
      trigger={
        <button
          className="cursor-pointer transition-opacity duration-300 outline-none hover:opacity-80"
          aria-label="Customise options"
        >
          <UserAvatarIcon className="size-8 min-w-8 text-slate-500" />
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
