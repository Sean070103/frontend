export function SkeletonCard() {
  return (
    <div className="space-y-4 p-4 rounded-lg bg-card border border-border">
      <div className="space-y-2">
        <div className="h-5 bg-muted rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-muted rounded w-full animate-pulse" />
        <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-8 bg-muted rounded w-16 animate-pulse" />
        <div className="h-8 bg-muted rounded w-16 animate-pulse" />
      </div>
    </div>
  )
}

export function SkeletonThread() {
  return (
    <div className="space-y-3 p-4 rounded-lg bg-card border border-border">
      <div className="flex gap-3">
        <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
          <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
        </div>
      </div>
      <div className="space-y-2 pl-13">
        <div className="h-4 bg-muted rounded w-full animate-pulse" />
        <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
      </div>
    </div>
  )
}

export function SkeletonComment() {
  return (
    <div className="space-y-2 p-3 bg-muted/30 rounded-md border border-border/50">
      <div className="flex gap-2">
        <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
        <div className="flex-1 space-y-1">
          <div className="h-3 bg-muted rounded w-1/3 animate-pulse" />
          <div className="h-2 bg-muted rounded w-1/4 animate-pulse" />
        </div>
      </div>
      <div className="space-y-2 pl-10">
        <div className="h-3 bg-muted rounded w-full animate-pulse" />
        <div className="h-3 bg-muted rounded w-4/5 animate-pulse" />
      </div>
    </div>
  )
}
