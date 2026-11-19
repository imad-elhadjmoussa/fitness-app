import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
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

function formatDay(day: string): string {
  const d = new Date(`${day}T00:00:00`)
  if (Number.isNaN(d.getTime())) return day
  return `${d.getMonth() + 1}/${d.getDate()}`
}

interface CaloriesChartProps {
  data: DailyStat[]
}

export function CaloriesChart({ data }: CaloriesChartProps) {
  const rows = data.map((d) => ({
    ...d,
    label: formatDay(d.day),
  }))

  return (
    <ChartContainer config={chartConfig} className="aspect-[2/1] w-full">
      <BarChart data={rows} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={40}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => {
                const row = payload?.[0]?.payload as DailyStat | undefined
                return row?.day ?? ""
              }}
            />
          }
        />
        <Bar
          dataKey="totalCalories"
          fill="var(--color-totalCalories)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  )
}
