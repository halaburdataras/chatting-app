'use client'

import React from 'react'
import { cn } from '@repo/shared/utils'
import { DropdownMenu } from 'radix-ui'

type DropdownProps = {
  trigger: React.ReactNode
  children?: React.ReactNode
  list: {
    label: string
    onClick: () => void
    variant?: string | 'default' | 'error'
    icon?: React.ReactNode
    disabled?: boolean
    dividerPosition?: string | 'top' | 'bottom'
  }[]
  align?: 'start' | 'center' | 'end'
}

export default function Dropdown({
  trigger,
  list,
  children,
  align = 'center',
}: DropdownProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade data-[side=right]:animate-slideLeftAndFade data-[side=top]:animate-slideDownAndFade z-[999] min-w-[220px] rounded-md bg-white p-[5px] shadow-md will-change-[opacity,transform]"
          sideOffset={5}
          align={align}
        >
          {children}

          {list.map((item) => (
            <React.Fragment key={item.label}>
              {item.dividerPosition === 'top' && <Separator />}
              <DropdownMenu.Item
                onClick={item.onClick}
                disabled={item.disabled}
                className={cn(
                  'group text-primary relative flex cursor-pointer items-center rounded-md py-1.5 pr-2 pl-3 text-sm font-medium transition-colors duration-200 select-none hover:outline-none',
                  (!item.variant || item.variant === 'default') &&
                    'bg-transparent hover:bg-slate-400/10',
                  item.variant === 'error' &&
                    'bg-transparent text-red-500 hover:bg-red-400/10',
                  item.disabled && 'cursor-not-allowed opacity-50'
                )}
              >
                {item.icon}
                {item.label}
              </DropdownMenu.Item>
              {item.dividerPosition === 'bottom' && <Separator />}
            </React.Fragment>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

const Separator = () => (
  <DropdownMenu.Separator className="mx-3 my-2 border-t border-dashed border-slate-500/20" />
)
