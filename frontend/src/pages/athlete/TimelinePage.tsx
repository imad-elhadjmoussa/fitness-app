import { useNavigate } from "react-router-dom"
import { Plus } from "lucide-react"
import { useRole } from "@/context/RoleContext"
import { useAuth } from "@/context/AuthContext"
import { useActivities } from "@/hooks/useActivities"
import { ActivityCard } from "@/components/ActivityCard"
import { ClientSelector } from "@/components/ClientSelector"
import { DataState } from "@/components/DataState"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export function TimelinePage() {
  const navigate = useNavigate()
  const { role, currentUserId } = useRole()
  const { user } = useAuth()
  const userId = role === "athlete" ? user?._id || "" : currentUserId
  const { data, isLoading, isError, error, refetch, isFetching } =
    useActivities(userId, 20)

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">{role === "coach" ? "Coach" : "Activity"}</p>
          <h1 className="page-title">Timeline</h1>
          <p className="page-subtitle">
            Last 20 workouts
            {role === "coach" ? " for the selected client" : ""}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {role === "coach" ? <ClientSelector /> : null}
          {role === "athlete" ? (
            <Button onClick={() => navigate("/workouts/new")}>
              <Plus className="size-4" />
              Log workout
            </Button>
          ) : null}
        </div>
      </header>

      <DataState
        isLoading={isLoading || (!data && isFetching)}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!data?.length}
        emptyMessage={
          role === "athlete"
            ? "No workouts yet — log your first session."
            : "No activities yet for this user."
        }
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
