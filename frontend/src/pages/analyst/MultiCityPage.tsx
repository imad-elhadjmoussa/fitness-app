import { useUsers } from "@/hooks/useUsers"
import { useMultiCity } from "@/hooks/useMultiCity"
import { DataState } from "@/components/DataState"
import { displayName } from "@/lib/mappers"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

export function MultiCityPage() {
  const multi = useMultiCity()
  const users = useUsers()

  const nameOf = (id: string) => {
    const u = users.data?.find((x) => x._id === id)
    return u ? displayName(u) : id
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Analyst</p>
          <h1 className="page-title">Multi-city</h1>
          <p className="page-subtitle">
            Users with workouts in two different cities within 24 hours.
          </p>
        </div>
      </header>

      <DataState
        isLoading={multi.isLoading || users.isLoading}
        isError={multi.isError || users.isError}
        error={multi.error ?? users.error}
        onRetry={() => {
          void multi.refetch()
          void users.refetch()
        }}
        isEmpty={!multi.data?.length}
        emptyMessage="No multi-city pairs found."
        loadingFallback={<Skeleton className="h-48 w-full" />}
      >
        <Card>
          <CardHeader>
            <CardTitle>Pairs under 24 h</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>City A</TableHead>
                  <TableHead>Time A</TableHead>
                  <TableHead>City B</TableHead>
                  <TableHead>Time B</TableHead>
                  <TableHead>Gap (h)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(multi.data ?? []).map((row, i) => (
                  <TableRow key={`${row.userId}-${i}`}>
                    <TableCell className="font-medium">
                      {nameOf(row.userId)}
                    </TableCell>
                    <TableCell>{row.cityA}</TableCell>
                    <TableCell>{formatTime(row.timeA)}</TableCell>
                    <TableCell>{row.cityB}</TableCell>
                    <TableCell>{formatTime(row.timeB)}</TableCell>
                    <TableCell>{row.gapHours}</TableCell>
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
