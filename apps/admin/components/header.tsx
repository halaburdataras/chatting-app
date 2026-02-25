import AccountPopover from './account-popover'
import Container from '@repo/ui/components/container'
import Menu from './Menu'

import DashboardIcon from '~icons/dashboard.svg'
import UsersIcon from '~icons/users.svg'
import MessagesIcon from '~icons/messages.svg'

const menuList = [
  {
    label: 'App',
    icon: <DashboardIcon className="size-6 min-w-6" />,
    href: '/',
  },
  {
    label: 'Users',
    icon: <UsersIcon className="size-6 min-w-6" />,
    href: '/users',
  },
  {
    label: 'Rooms',
    icon: <MessagesIcon className="size-6 min-w-6" />,
    href: '/rooms',
  },
]

export default function Header() {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 bg-white shadow-sm">
      <Container className="flex min-h-16 items-center justify-between">
        <span className="text-2xl font-bold select-none">Chatting App</span>
        <Menu list={menuList} />
        <AccountPopover />
      </Container>
    </header>
  )
}
