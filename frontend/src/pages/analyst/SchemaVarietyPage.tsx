import { useUsers } from "@/hooks/useUsers"
import { useSchemaVariety } from "@/hooks/useSchemaVariety"
import { DataState } from "@/components/DataState"
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

  const nameOf = (id: string) =>
    users.data?.find((u) => u._id === id)?.name ?? id

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Schema variety</h1>
        <p className="text-sm text-muted-foreground">
          Optional GPS, heart-rate and photo fields differ by device type.
        </p>
      </div>

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
                    <TableCell>{mark(Boolean(a.gps))}</TableCell>
                    <TableCell>
                      {mark(
                        Array.isArray(a.hrSeries) && a.hrSeries.length > 0
                      )}
                    </TableCell>
                    <TableCell>
                      {mark(Array.isArray(a.photos) && a.photos.length > 0)}
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
