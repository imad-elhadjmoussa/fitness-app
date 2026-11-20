import { useMemo } from "react"
import { useAuth } from "@/context/AuthContext"
import { useLeaderboard } from "@/hooks/useLeaderboard"
import { DataState } from "@/components/DataState"
import { KpiCard } from "@/components/KpiCard"
import { StreakTable } from "@/components/StreakTable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function StreakPage() {
  const { user } = useAuth()
  const userId = user?._id || ""
  const leaderboard = useLeaderboard()

  const me = useMemo(
    () => (leaderboard.data ?? []).find((r) => r.userId === userId),
    [leaderboard.data, userId]
  )

  const rank = useMemo(() => {
    const idx = (leaderboard.data ?? []).findIndex((r) => r.userId === userId)
    return idx >= 0 ? idx + 1 : "—"
  }, [leaderboard.data, userId])

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Consistency</p>
          <h1 className="page-title">Streak</h1>
          <p className="page-subtitle">
            Leaderboard lists athletes. Full streak metrics arrive when the analytics API is ready.
          </p>
        </div>
      </header>

      <DataState
        isLoading={leaderboard.isLoading}
        isError={leaderboard.isError}
        error={leaderboard.error}
        onRetry={() => void leaderboard.refetch()}
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
          <KpiCard title="Current streak" value={me?.current ?? "—"} hint="days" />
          <KpiCard title="Longest streak" value={me?.longest ?? "—"} hint="days" />
          <KpiCard title="Rank" value={`#${rank}`} />
        </div>

        <Card className="surface-card">
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <StreakTable
              rows={leaderboard.data ?? []}
              highlightUserId={userId}
            />
          </CardContent>
        </Card>
      </DataState>
    </div>
  )
}
