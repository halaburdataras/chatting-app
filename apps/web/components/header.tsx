import AccountPopover from '@repo/ui/components/account-popover'
import Container from '@repo/ui/components/container'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 bg-white shadow-sm">
      <Container className="flex min-h-16 items-center justify-between">
        <Link href="/" className="text-2xl font-bold select-none transition-opacity duration-200 hover:opacity-80">Chatting App</Link>
        <AccountPopover />
      </Container>
    </header>
  )
}
