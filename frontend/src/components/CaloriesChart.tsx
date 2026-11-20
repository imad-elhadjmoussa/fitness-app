import { useMemo } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"
import type { DailyStat } from "@/types"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const chartConfig = {
  totalCalories: {
    label: "kcal",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function parseDay(day: string): Date {
  return new Date(`${day}T12:00:00`)
}

function formatTick(day: string): string {
  const d = parseDay(day)
  if (Number.isNaN(d.getTime())) return day
  return String(d.getDate())
}

function formatTooltipLabel(day: string): string {
  const d = parseDay(day)
  if (Number.isNaN(d.getTime())) return day
  return `${WEEKDAY[d.getDay()]} ${d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })}`
}

interface ChartRow extends DailyStat {
  label: string
  isToday: boolean
}

interface CaloriesChartProps {
  data: DailyStat[]
  /** ISO date YYYY-MM-DD of the first day in the series */
  from: string
  /** ISO date YYYY-MM-DD of the last day in the series */
  to: string
}

/** Build every calendar day in [from, to], filling missing days with 0 kcal. */
export function fillDailySeries(
  data: DailyStat[],
  from: string,
  to: string,
  userId = ""
): DailyStat[] {
  const byDay = new Map(data.map((d) => [d.day, d.totalCalories]))
  const rows: DailyStat[] = []
  const cursor = parseDay(from)
  const end = parseDay(to)
  if (Number.isNaN(cursor.getTime()) || Number.isNaN(end.getTime())) {
    return data
  }

  while (cursor <= end) {
    const day = cursor.toISOString().slice(0, 10)
    rows.push({
      userId: data[0]?.userId ?? userId,
      day,
      totalCalories: byDay.get(day) ?? 0,
    })
    cursor.setDate(cursor.getDate() + 1)
  }
  return rows
}

export function CaloriesChart({ data, from, to }: CaloriesChartProps) {
  const today = new Date().toISOString().slice(0, 10)

  const rows: ChartRow[] = useMemo(() => {
    return fillDailySeries(data, from, to).map((d) => ({
      ...d,
      label: formatTick(d.day),
      isToday: d.day === today,
    }))
  }, [data, from, to, today])

  const maxVal = Math.max(0, ...rows.map((r) => r.totalCalories))
  // Keep Y scale realistic so a single day doesn't dominate visually
  const yMax = Math.max(500, Math.ceil((maxVal || 400) / 100) * 100)

  return (
    <ChartContainer config={chartConfig} className="aspect-[21/9] w-full min-h-[260px]">
      <BarChart
        data={rows}
        margin={{ left: 4, right: 8, top: 12, bottom: 4 }}
        barCategoryGap="18%"
      >
        <CartesianGrid
          vertical={false}
          strokeDasharray="3 3"
          stroke="var(--border)"
        />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          interval={0}
          tick={{ fontSize: 11 }}
          tickFormatter={(value, index) => {
            // Show every other day label when the month is dense
            if (rows.length > 20 && index % 2 !== 0) return ""
            return String(value)
          }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={44}
          domain={[0, yMax]}
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : String(v))}
        />
        <ReferenceLine
          y={0}
          stroke="var(--border)"
        />
        <ChartTooltip
          cursor={{ fill: "var(--muted)", opacity: 0.45 }}
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => {
                const row = payload?.[0]?.payload as ChartRow | undefined
                return row ? formatTooltipLabel(row.day) : ""
              }}
              formatter={(value) => (
                <span className="font-medium tabular-nums">
                  {Number(value).toLocaleString()} kcal
                </span>
              )}
            />
          }
        />
        <Bar
          dataKey="totalCalories"
          name="Burn"
          radius={[3, 3, 0, 0]}
          maxBarSize={18}
          minPointSize={0}
        >
          {rows.map((row) => (
            <Cell
              key={row.day}
              fill={
                row.totalCalories <= 0
                  ? "color-mix(in oklch, var(--chart-1) 18%, transparent)"
                  : row.isToday
                    ? "var(--chart-2)"
                    : "var(--color-totalCalories)"
              }
              opacity={row.totalCalories <= 0 ? 0.55 : 1}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
