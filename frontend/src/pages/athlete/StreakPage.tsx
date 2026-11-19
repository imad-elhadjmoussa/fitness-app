import { useMemo } from "react"
import { useRole } from "@/context/RoleContext"
import { useLeaderboard } from "@/hooks/useLeaderboard"
import { useUsers } from "@/hooks/useUsers"
import { DataState } from "@/components/DataState"
import { KpiCard } from "@/components/KpiCard"
import { StreakTable } from "@/components/StreakTable"
import { ATHLETE_USER_ID } from "@/lib/roles"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function StreakPage() {
  const { currentUserId } = useRole()
  const userId = ATHLETE_USER_ID
  const leaderboard = useLeaderboard()
  const users = useUsers()

  const isLoading = leaderboard.isLoading || users.isLoading
  const isError = leaderboard.isError || users.isError
  const error = leaderboard.error ?? users.error

  const me = useMemo(
    () => users.data?.find((u) => u._id === userId),
    [users.data, userId]
  )

  const rank = useMemo(() => {
    const idx = (leaderboard.data ?? []).findIndex((r) => r.userId === userId)
    return idx >= 0 ? idx + 1 : "—"
  }, [leaderboard.data, userId])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Streak</h1>
        <p className="text-sm text-muted-foreground">
          Your streak and the leaderboard.
        </p>
      </div>

      <DataState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => {
          void leaderboard.refetch()
          void users.refetch()
        }}
        isEmpty={!leaderboard.data?.length}
        emptyMessage="No streak data available."
        loadingFallback={
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
            <Skeleton className="h-48 w-full" />
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <KpiCard
            title="Current streak"
            value={me?.streak.current ?? "—"}
            hint="days"
          />
          <KpiCard
            title="Longest streak"
            value={me?.streak.longest ?? "—"}
            hint="days"
          />
          <KpiCard title="Rank" value={`#${rank}`} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <StreakTable
              rows={leaderboard.data ?? []}
              highlightUserId={currentUserId || userId}
            />
          </CardContent>
        </Card>
      </DataState>
    </div>
  )
}
