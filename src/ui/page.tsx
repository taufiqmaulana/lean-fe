import { cn } from 'cn'
import type { ReactNode } from 'react'

type PageProps = {
  title: ReactNode
  description?: ReactNode
  /** Actions rendered on the right side of the page header. */
  toolbar?: ReactNode
  children?: ReactNode
  className?: string
}

export function Page({ title, description, toolbar, children, className }: PageProps) {
  return (
    <div data-slot="page" className={cn('flex flex-1 flex-col gap-6', className)}>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="truncate text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>
        {toolbar && <div className="flex shrink-0 flex-wrap items-center gap-2">{toolbar}</div>}
      </header>
      <div className="flex flex-1 flex-col gap-4">{children}</div>
    </div>
  )
}
