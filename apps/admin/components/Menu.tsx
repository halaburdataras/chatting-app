'use client'

import React, { RefObject } from 'react'
import { NavigationMenu } from 'radix-ui'
import { cn } from '@repo/shared/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type MenuProps = {
  list: {
    label: string
    icon: React.ReactNode
    href: string
  }[]
  className?: string
}

const Menu = ({ list, className }: MenuProps) => {
  const pathname = usePathname()

  return (
    <NavigationMenu.Root className={cn(className)}>
      <NavigationMenu.List className="m-0 flex list-none gap-2">
        {list.map((item) => (
          <ListItem
            key={item.label}
            title={item.label}
            icon={item.icon}
            href={item.href}
            isActive={pathname === item.href}
          />
        ))}
      </NavigationMenu.List>
    </NavigationMenu.Root>
  )
}

type ListItemProps = {
  className?: string
  title: string
  icon: React.ReactNode
  href: string
  isActive: boolean
}

const ListItem = React.forwardRef(
  (
    { className, title, icon, href, isActive, ...props }: ListItemProps,
    forwardedRef
  ) => (
    <li>
      <NavigationMenu.Link asChild active={isActive}>
        <Link
          href={href}
          className={cn(
            'flex items-center gap-2 rounded-md px-2 py-1.5 text-slate-500 transition-colors duration-200 select-none hover:bg-slate-400/20',
            className,
            isActive && 'bg-slate-400/20'
          )}
          {...props}
          ref={forwardedRef as RefObject<HTMLAnchorElement>}
        >
          {icon}
          <span className="text-sm font-semibold">{title}</span>
        </Link>
      </NavigationMenu.Link>
    </li>
  )
)

ListItem.displayName = 'ListItem'

export default Menu
