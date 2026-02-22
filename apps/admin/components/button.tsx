import { cn } from '@repo/shared/utils'
import { forwardRef } from 'react'

type ButtonProps = {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  variant?: 'primary' | 'secondary' | 'error' | 'icon' | 'text' | 'text-error' | 'outline'
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  disabled?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      onClick,
      className,
      variant = 'primary',
      disabled = false,
      icon,
      iconPosition = 'left',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className={cn(
          'flex cursor-pointer items-center justify-center gap-2 rounded-lg border-0 px-4 py-3 text-sm font-medium outline-none',
          className,
          variant === 'primary' && 'bg-slate-900 text-white',
          variant === 'secondary' && '',
          variant === 'error' && 'bg-red-400 text-white',
          variant === 'icon' &&
            'rounded-full bg-transparent p-2 text-slate-900 transition-colors duration-200 hover:bg-gray-400/10 data-[disabled=true]:hover:bg-transparent',
          variant === 'text' &&
            'bg-transparent p-0 text-slate-900 transition-colors duration-200 hover:text-slate-900/70 data-[disabled=true]:hover:text-slate-900',
          variant === 'text-error' &&
            'bg-transparent p-0 text-red-500 transition-colors duration-200 hover:text-red-500/70 data-[disabled=true]:hover:text-red-500',
          variant === 'outline' &&
            'bg-transparent border border-gray-400/20 text-slate-400 transition-colors duration-200 hover:border-slate-900 data-[disabled=true]:hover:border-gray-400/20',
          disabled && 'cursor-not-allowed opacity-50'
        )}
        disabled={disabled}
        data-disabled={disabled}
        {...props}
      >
        {icon && iconPosition === 'left' && icon}
        {children}
        {icon && iconPosition === 'right' && icon}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
