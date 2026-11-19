import { useMemo } from "react"
import { useQueries } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { getActivities, getCalories } from "@/api"
import { useUsers } from "@/hooks/useUsers"
import { useRole } from "@/context/RoleContext"
import { DataState } from "@/components/DataState"
import { StatusBadge } from "@/components/StatusBadge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function rangeLast7(): { from: string; to: string } {
  const to = new Date("2026-11-19T00:00:00Z")
  const from = new Date(to)
  from.setUTCDate(from.getUTCDate() - 6)
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  }
}

function daysSince(iso?: string): number | null {
  if (!iso) return null
  const then = new Date(iso.includes("T") ? iso : `${iso}T00:00:00Z`)
  const now = new Date("2026-11-19T12:00:00Z")
  const diff = now.getTime() - then.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function ClientsPage() {
  const navigate = useNavigate()
  const { setCurrentUserId } = useRole()
  const usersQuery = useUsers()
  const users = usersQuery.data ?? []
  const range = useMemo(() => rangeLast7(), [])

  const activityQueries = useQueries({
    queries: users.map((u) => ({
      queryKey: ["activities", u._id, 1],
      queryFn: () => getActivities(u._id, 1),
      enabled: users.length > 0,
    })),
  })

  const calorieQueries = useQueries({
    queries: users.map((u) => ({
      queryKey: ["calories", u._id, range.from, range.to],
      queryFn: () => getCalories(u._id, range.from, range.to),
      enabled: users.length > 0,
    })),
  })

  const isLoading =
    usersQuery.isLoading ||
    activityQueries.some((q) => q.isLoading) ||
    calorieQueries.some((q) => q.isLoading)

  const isError =
    usersQuery.isError ||
    activityQueries.some((q) => q.isError) ||
    calorieQueries.some((q) => q.isError)

  const rows = users.map((user, i) => {
    const lastActivity = activityQueries[i]?.data?.[0]
    const lastDate =
      lastActivity?.startedAt ?? user.streak.lastActiveDate ?? undefined
    const kcal7 = (calorieQueries[i]?.data ?? []).reduce(
      (sum, d) => sum + d.totalCalories,
      0
    )
    const idle = daysSince(lastDate)
    const status =
      idle === null || idle > 2 ? ("Needs a nudge" as const) : ("On track" as const)

    return {
      user,
      lastDate: lastDate
        ? new Date(lastDate).toLocaleDateString()
        : "—",
      kcal7,
      status,
    }
  })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Clients</h1>
        <p className="text-sm text-muted-foreground">
          Overview of athletes. Click a row to open their timeline.
        </p>
      </div>

      <DataState
        isLoading={isLoading}
        isError={isError}
        error={usersQuery.error}
        onRetry={() => {
          void usersQuery.refetch()
          activityQueries.forEach((q) => void q.refetch())
          calorieQueries.forEach((q) => void q.refetch())
        }}
        isEmpty={!rows.length}
        emptyMessage="No clients found."
        loadingFallback={<Skeleton className="h-64 w-full" />}
      >
        <Card>
          <CardHeader>
            <CardTitle>All clients</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Goal</TableHead>
                  <TableHead>Streak</TableHead>
                  <TableHead>Last activity</TableHead>
                  <TableHead>kcal (7d)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ user, lastDate, kcal7, status }) => (
                  <TableRow
                    key={user._id}
                    className="cursor-pointer"
                    onClick={() => {
                      setCurrentUserId(user._id)
                      navigate("/timeline")
                    }}
                  >
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.goal}</TableCell>
                    <TableCell>{user.streak.current}</TableCell>
                    <TableCell>{lastDate}</TableCell>
                    <TableCell>{kcal7}</TableCell>
                    <TableCell>
                      <StatusBadge kind="client" value={status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </DataState>
    </div>
  )
}
