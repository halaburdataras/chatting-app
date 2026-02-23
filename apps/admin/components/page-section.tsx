import { cn } from '@repo/shared/utils'

type PageSectionProps = {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export default function PageSection({
  title,
  description,
  children,
  className,
}: PageSectionProps) {
  return (
    <section className={cn('mt-6 grid grid-cols-[1fr_1.5fr] gap-6', className)}>
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        {description && (
          <p className="mt-1 text-sm font-medium text-slate-500">
            {description}
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-lg p-6 shadow-[0_0_2px_0_rgba(145,158,171,0.2),0_12px_24px_-4px_rgba(145,158,171,0.12)]">
        {children}
      </div>
    </section>
  )
}
