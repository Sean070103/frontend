import { Search, MessageSquare } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
  icon?: 'search' | 'message'
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ 
  title, 
  description, 
  icon = 'message',
  action 
}: EmptyStateProps) {
  const IconComponent = icon === 'search' ? Search : MessageSquare

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-muted p-4 mb-4">
        <IconComponent className="w-8 h-8 text-muted-foreground" />
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2 text-center">
        {title}
      </h3>
      
      <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
        {description}
      </p>

      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all duration-300 ease-out"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
