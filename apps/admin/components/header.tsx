import AccountPopover from './account-popover'
import Container from './container'

export default function Header() {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 bg-white shadow-sm">
      <Container className="flex min-h-16 items-center justify-between">
        <span className="text-2xl font-bold select-none">Chatting App</span>
        <AccountPopover />
      </Container>
    </header>
  )
}
