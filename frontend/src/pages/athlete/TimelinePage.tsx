import { useRole } from "@/context/RoleContext"
import { useActivities } from "@/hooks/useActivities"
import { ActivityCard } from "@/components/ActivityCard"
import { ClientSelector } from "@/components/ClientSelector"
import { DataState } from "@/components/DataState"
import { ATHLETE_USER_ID } from "@/lib/roles"
import { Skeleton } from "@/components/ui/skeleton"

export function TimelinePage() {
  const { role, currentUserId } = useRole()
  const userId = role === "athlete" ? ATHLETE_USER_ID : currentUserId
  const { data, isLoading, isError, error, refetch, isFetching } =
    useActivities(userId, 20)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Timeline</h1>
          <p className="text-sm text-muted-foreground">
            Last 20 activities{role === "coach" ? " for the selected client" : ""}.
          </p>
        </div>
        {role === "coach" ? <ClientSelector /> : null}
      </div>

      <DataState
        isLoading={isLoading || (!data && isFetching)}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!data?.length}
        emptyMessage="No activities yet for this user."
        loadingFallback={
          <div className="space-y-3">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        }
      >
        <div className="grid gap-3">
          {(data ?? []).map((activity) => (
            <ActivityCard key={activity._id} activity={activity} />
          ))}
        </div>
      </DataState>
    </div>
  )
}
