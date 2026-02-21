import { cn } from '@repo/shared/utils'

type ButtonProps = {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  variant?: 'primary' | 'secondary' | 'error'
}

const Button = ({
  children,
  onClick,
  className,
  variant = 'primary',
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'cursor-pointer rounded-lg px-4 py-3 text-sm font-medium',
        className,
        variant === 'primary' && 'bg-slate-900 text-white',
        variant === 'secondary' && '',
        variant === 'error' && 'bg-red-400 text-white'
      )}
    >
      {children}
    </button>
  )
}

export default Button
