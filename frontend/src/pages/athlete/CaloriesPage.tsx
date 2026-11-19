import { useMemo } from "react"
import { useRole } from "@/context/RoleContext"
import { useCalories } from "@/hooks/useCalories"
import { CaloriesChart } from "@/components/CaloriesChart"
import { ClientSelector } from "@/components/ClientSelector"
import { DataState } from "@/components/DataState"
import { KpiCard } from "@/components/KpiCard"
import { ATHLETE_USER_ID } from "@/lib/roles"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function last14DayRange(): { from: string; to: string } {
  const to = new Date("2026-11-19T00:00:00Z")
  const from = new Date(to)
  from.setUTCDate(from.getUTCDate() - 13)
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  return { from: fmt(from), to: fmt(to) }
}

export function CaloriesPage() {
  const { role, currentUserId } = useRole()
  const userId = role === "athlete" ? ATHLETE_USER_ID : currentUserId
  const range = useMemo(() => last14DayRange(), [])
  const { data, isLoading, isError, error, refetch } = useCalories(
    userId,
    range.from,
    range.to
  )

  const kpis = useMemo(() => {
    const rows = data ?? []
    const total = rows.reduce((sum, r) => sum + r.totalCalories, 0)
    const avg = rows.length ? Math.round(total / rows.length) : 0
    const best = rows.reduce(
      (acc, r) =>
        r.totalCalories > acc.totalCalories ? r : acc,
      rows[0] ?? { day: "—", totalCalories: 0, userId }
    )
    return { total, avg, best }
  }, [data, userId])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Calories</h1>
          <p className="text-sm text-muted-foreground">
            14-day calorie burn{role === "coach" ? " for the selected client" : ""}.
          </p>
        </div>
        {role === "coach" ? <ClientSelector /> : null}
      </div>

      <DataState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!data?.length}
        emptyMessage="No calorie data for this range."
        loadingFallback={
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <KpiCard title="14-day total" value={`${kpis.total} kcal`} />
          <KpiCard title="Daily average" value={`${kpis.avg} kcal`} />
          <KpiCard
            title="Best day"
            value={`${kpis.best.totalCalories} kcal`}
            hint={kpis.best.day}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daily burn</CardTitle>
          </CardHeader>
          <CardContent>
            <CaloriesChart data={data ?? []} />
          </CardContent>
        </Card>
      </DataState>
    </div>
  )
}
