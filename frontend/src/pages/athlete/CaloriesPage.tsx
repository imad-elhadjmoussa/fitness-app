import { useMemo } from "react"
import { useRole } from "@/context/RoleContext"
import { useAuth } from "@/context/AuthContext"
import { useCalories } from "@/hooks/useCalories"
import { CaloriesChart, fillDailySeries } from "@/components/CaloriesChart"
import { ClientSelector } from "@/components/ClientSelector"
import { DataState } from "@/components/DataState"
import { KpiCard } from "@/components/KpiCard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function currentMonthRange(): { from: string; to: string; label: string } {
  const now = new Date()
  const fromDate = new Date(now.getFullYear(), now.getMonth(), 1)
  const toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const fmt = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
  }
  const label = now.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  })
  return { from: fmt(fromDate), to: fmt(toDate), label }
}

export function CaloriesPage() {
  const { role, currentUserId } = useRole()
  const { user } = useAuth()
  const userId = role === "athlete" ? user?._id || "" : currentUserId
  const range = useMemo(() => currentMonthRange(), [])
  const { data, isLoading, isError, error, refetch } = useCalories(
    userId,
    range.from,
    range.to
  )

  const monthSeries = useMemo(
    () => fillDailySeries(data ?? [], range.from, range.to, userId),
    [data, range.from, range.to, userId]
  )

  const kpis = useMemo(() => {
    const activeDays = monthSeries.filter((r) => r.totalCalories > 0)
    const total = monthSeries.reduce((sum, r) => sum + r.totalCalories, 0)
    const avg = activeDays.length
      ? Math.round(total / activeDays.length)
      : 0
    const best = monthSeries.reduce(
      (acc, r) => (r.totalCalories > acc.totalCalories ? r : acc),
      monthSeries[0] ?? { day: "—", totalCalories: 0, userId }
    )
    return {
      total,
      avg,
      best,
      activeDays: activeDays.length,
      daysInMonth: monthSeries.length,
    }
  }, [monthSeries, userId])

  const hasAnyBurn = kpis.total > 0

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Analytics</p>
          <h1 className="page-title">Calories</h1>
          <p className="page-subtitle">
            Monthly calorie burn for {range.label}
            {role === "coach" ? " · selected client" : ""}.
          </p>
        </div>
        {role === "coach" ? <ClientSelector /> : null}
      </header>

      <DataState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={false}
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
          <KpiCard
            title="Month total"
            value={`${kpis.total.toLocaleString()} kcal`}
            hint={`${kpis.activeDays} active day${kpis.activeDays === 1 ? "" : "s"}`}
          />
          <KpiCard
            title="Avg / active day"
            value={`${kpis.avg.toLocaleString()} kcal`}
            hint={`across ${kpis.daysInMonth} days`}
          />
          <KpiCard
            title="Best day"
            value={
              hasAnyBurn
                ? `${kpis.best.totalCalories.toLocaleString()} kcal`
                : "—"
            }
            hint={hasAnyBurn ? kpis.best.day : "No sessions yet"}
          />
        </div>

        <Card className="surface-card">
          <CardHeader>
            <CardTitle>Daily burn</CardTitle>
            <CardDescription>
              Full {range.label} calendar · empty days stay at 0 so bar width
              stays consistent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CaloriesChart
              data={data ?? []}
              from={range.from}
              to={range.to}
            />
            {!hasAnyBurn ? (
              <p className="mt-3 text-center text-sm text-muted-foreground">
                No calories logged this month yet. Log a workout with calories to
                see activity here.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </DataState>
    </div>
  )
}
