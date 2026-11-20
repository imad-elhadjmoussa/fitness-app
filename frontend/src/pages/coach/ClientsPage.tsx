import { useMemo } from "react"
import { useQueries } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { getActivities, getCalories } from "@/api"
import { useUsers } from "@/hooks/useUsers"
import { useRole } from "@/context/RoleContext"
import { DataState } from "@/components/DataState"
import { StatusBadge } from "@/components/StatusBadge"
import { displayName, goalLabel } from "@/lib/mappers"
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
  const to = new Date()
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
  const now = new Date()
  return Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24))
}

export function ClientsPage() {
  const navigate = useNavigate()
  const { setCurrentUserId } = useRole()
  const usersQuery = useUsers()
  const athletes = useMemo(
    () => (usersQuery.data ?? []).filter((u) => u.role === "athlete"),
    [usersQuery.data]
  )
  const range = useMemo(() => rangeLast7(), [])

  const activityQueries = useQueries({
    queries: athletes.map((u) => ({
      queryKey: ["activities", u._id, 1],
      queryFn: () => getActivities(u._id, 1),
      enabled: athletes.length > 0,
    })),
  })

  const calorieQueries = useQueries({
    queries: athletes.map((u) => ({
      queryKey: ["calories", u._id, range.from, range.to],
      queryFn: () => getCalories(u._id, range.from, range.to),
      enabled: athletes.length > 0,
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

  const rows = athletes.map((user, i) => {
    const lastActivity = activityQueries[i]?.data?.[0]
    const lastDate = lastActivity?.startedAt
    const kcal7 = (calorieQueries[i]?.data ?? []).reduce(
      (sum, d) => sum + d.totalCalories,
      0
    )
    const idle = daysSince(lastDate)
    const status =
      idle === null || idle > 2
        ? ("Needs a nudge" as const)
        : ("On track" as const)

    return {
      user,
      lastDate: lastDate ? new Date(lastDate).toLocaleDateString() : "—",
      kcal7,
      status,
    }
  })

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Coach</p>
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">
            Overview of athletes. Click a row to open their timeline.
          </p>
        </div>
      </header>

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
        emptyMessage="No athlete clients found. Ask athletes to register with the athlete role."
        loadingFallback={<Skeleton className="h-64 w-full" />}
      >
        <Card className="surface-card">
          <CardHeader>
            <CardTitle>All clients</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Goal</TableHead>
                  <TableHead>Weight</TableHead>
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
                    <TableCell className="font-medium">
                      {displayName(user)}
                    </TableCell>
                    <TableCell>
                      {goalLabel(user.profile?.fitnessGoal)}
                    </TableCell>
                    <TableCell>
                      {user.profile?.weight != null
                        ? `${user.profile.weight} kg`
                        : "—"}
                    </TableCell>
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
