import { cn } from '@repo/shared/utils'

type ButtonProps = {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  variant?: 'primary' | 'secondary' | 'error'
  disabled?: boolean
}

const Button = ({
  children,
  onClick,
  className,
  variant = 'primary',
  disabled = false,
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'cursor-pointer rounded-lg px-4 py-3 text-sm font-medium',
        className,
        variant === 'primary' && 'bg-slate-900 text-white',
        variant === 'secondary' && '',
        variant === 'error' && 'bg-red-400 text-white',
        disabled && 'cursor-not-allowed opacity-50'
      )}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default Button
