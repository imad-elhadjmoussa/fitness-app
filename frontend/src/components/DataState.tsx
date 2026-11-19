import type { ReactNode } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface DataStateProps {
  isLoading: boolean
  isError: boolean
  isEmpty?: boolean
  error?: Error | null
  onRetry?: () => void
  emptyMessage?: string
  loadingFallback?: ReactNode
  children: ReactNode
}

function DefaultSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}

export function DataState({
  isLoading,
  isError,
  isEmpty = false,
  error,
  onRetry,
  emptyMessage = "Nothing to show yet.",
  loadingFallback,
  children,
}: DataStateProps) {
  if (isLoading) {
    return <>{loadingFallback ?? <DefaultSkeleton />}</>
  }

  if (isError) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="size-4" />
          <p className="text-sm font-medium">
            {error?.message ?? "Something went wrong."}
          </p>
        </div>
        {onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        ) : null}
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return <>{children}</>
}
