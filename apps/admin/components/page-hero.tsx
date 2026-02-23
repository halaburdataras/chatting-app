'use client'

import Breadcrumbs from './breadcrumbs'
import Button from './button'

type PageHeroProps = {
  title: string
  description?: string
  breadcrumbs: {
    label: string
    href: string
  }[]
  actions?: {
    label: string
    onClick?: () => void
    icon?: React.ReactNode
    href?: string
  }[]
}

export default function PageHero({
  title,
  description,
  breadcrumbs,
  actions,
}: PageHeroProps) {
  return (
    <section className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && (
          <p className="font-medium text-slate-500">{description}</p>
        )}
        <Breadcrumbs breadcrumbs={breadcrumbs} className="mt-2" />
      </div>
      {!!actions && actions.length > 0 && (
        <div className="flex items-center gap-2">
          {actions.map((action) => (
            <Button
              key={action.label}
              onClick={action.onClick}
              icon={action.icon}
              iconPosition="left"
              href={action.href}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </section>
  )
}
