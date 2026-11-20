import { useUsers } from "@/hooks/useUsers"
import { useSchemaVariety } from "@/hooks/useSchemaVariety"
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

function mark(present: boolean): string {
  return present ? "✓" : "—"
}

export function SchemaVarietyPage() {
  const schema = useSchemaVariety()
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
          <h1 className="page-title">Schema variety</h1>
          <p className="page-subtitle">
            Optional GPS, heart-rate and photo fields differ by device type.
          </p>
        </div>
      </header>

      <DataState
        isLoading={schema.isLoading || users.isLoading}
        isError={schema.isError || users.isError}
        error={schema.error ?? users.error}
        onRetry={() => {
          void schema.refetch()
          void users.refetch()
        }}
        isEmpty={!schema.data?.length}
        emptyMessage="No activities to inspect."
        loadingFallback={<Skeleton className="h-64 w-full" />}
      >
        <Card>
          <CardHeader>
            <CardTitle>Documents in activities</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>GPS</TableHead>
                  <TableHead>Heart rate</TableHead>
                  <TableHead>Photos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(schema.data ?? []).map((a) => (
                  <TableRow key={a._id}>
                    <TableCell className="font-medium">
                      {nameOf(a.userId)}
                    </TableCell>
                    <TableCell className="capitalize">{a.type}</TableCell>
                    <TableCell>{a.deviceType}</TableCell>
                    <TableCell>{a.city}</TableCell>
                    <TableCell>
                      {mark(Boolean(a.gps || a.gpsRoute))}
                    </TableCell>
                    <TableCell>
                      {mark(
                        Boolean(a.heartRate) ||
                          (Array.isArray(a.hrSeries) && a.hrSeries.length > 0)
                      )}
                    </TableCell>
                    <TableCell>
                      {mark(
                        (a.photoCount ?? 0) > 0 ||
                          (Array.isArray(a.photos) && a.photos.length > 0) ||
                          (Array.isArray(a.photoObjects) &&
                            a.photoObjects.length > 0)
                      )}
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
