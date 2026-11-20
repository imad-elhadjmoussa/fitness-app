import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { useEngagement } from "@/hooks/useEngagement"
import { useSchemaVariety } from "@/hooks/useSchemaVariety"
import { DataState } from "@/components/DataState"
import { KpiCard } from "@/components/KpiCard"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const chartConfig = {
  activeUsers: {
    label: "Active users",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

function formatDay(day: string): string {
  const d = new Date(`${day}T00:00:00`)
  if (Number.isNaN(d.getTime())) return day
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export function EngagementPage() {
  const engagement = useEngagement()
  const schema = useSchemaVariety()

  const isLoading = engagement.isLoading || schema.isLoading
  const isError = engagement.isError || schema.isError

  const kpis = useMemo(() => {
    const days = engagement.data ?? []
    const activities = schema.data ?? []
    const activeUsers7d = Math.max(0, ...days.map((d) => d.activeUsers), 0)
    const uniqueActiveSum = days.reduce((s, d) => s + d.activeUsers, 0)
    const weekStart = "2026-11-13"
    const workoutsThisWeek = activities.filter(
      (a) => a.startedAt.slice(0, 10) >= weekStart
    )
    const avgKcal = workoutsThisWeek.length
      ? Math.round(
          workoutsThisWeek.reduce((s, a) => s + a.calories, 0) /
            workoutsThisWeek.length
        )
      : 0

    const variants = new Set(
      activities.map((a) => {
        const flags = [
          a.gps ? "gps" : "",
          a.hrSeries ? "hr" : "",
          a.photos ? "photos" : "",
          a.deviceType,
        ].join("|")
        return flags
      })
    )

    return {
      activeUsers7d: activeUsers7d || uniqueActiveSum,
      workouts: workoutsThisWeek.length,
      avgKcal,
      variants: variants.size,
    }
  }, [engagement.data, schema.data])

  const chartRows = (engagement.data ?? []).map((d) => ({
    ...d,
    label: formatDay(d.day),
  }))

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Analyst</p>
          <h1 className="page-title">Engagement</h1>
          <p className="page-subtitle">
            Active users and weekly workout activity. Full engagement series
            requires the analytics API or mock mode.
          </p>
        </div>
      </header>

      <DataState
        isLoading={isLoading}
        isError={isError}
        error={engagement.error ?? schema.error}
        onRetry={() => {
          void engagement.refetch()
          void schema.refetch()
        }}
        isEmpty={!engagement.data?.length}
        emptyMessage="No engagement data."
        loadingFallback={
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Active users (peak 7d)" value={kpis.activeUsers7d} />
          <KpiCard title="Workouts this week" value={kpis.workouts} />
          <KpiCard title="Avg kcal / workout" value={kpis.avgKcal} />
          <KpiCard title="Schema variants" value={kpis.variants} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active users per day</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="aspect-[2/1] w-full">
              <BarChart
                data={chartRows}
                margin={{ left: 8, right: 8, top: 8, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="activeUsers"
                  fill="var(--color-activeUsers)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </DataState>
    </div>
  )
}
