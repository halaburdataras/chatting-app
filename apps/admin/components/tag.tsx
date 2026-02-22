import { cn } from '@repo/shared/utils'

type TagProps = {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
  className?: string
}

export default function Tag({
  children,
  variant = 'primary',
  className,
}: TagProps) {
  return (
    <span
      className={cn(
        'block w-fit rounded-md px-1.5 py-0.5 text-xs leading-5 font-bold',
        variant === 'primary' && 'bg-slate-950 text-white',
        variant === 'secondary' && 'bg-violet-800 text-white',
        variant === 'error' && 'bg-red-300 text-white',
        variant === 'warning' && 'bg-yellow-300 text-white',
        variant === 'info' && 'bg-blue-300 text-white',
        variant === 'success' && 'bg-green-300 text-white',
        className
      )}
    >
      {children}
    </span>
  )
}
