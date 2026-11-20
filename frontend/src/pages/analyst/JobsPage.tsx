import { useJobs } from "@/hooks/useJobs"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

export function JobsPage() {
  const { data, isLoading, isError, error, refetch } = useJobs()

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Ops</p>
          <h1 className="page-title">Jobs</h1>
          <p className="page-subtitle">
            Scheduler jobs that refresh analytics collections (mock until the jobs API ships).
          </p>
        </div>
      </header>

      <DataState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!data?.length}
        emptyMessage="No jobs registered."
        loadingFallback={<Skeleton className="h-64 w-full" />}
      >
        <Card>
          <CardHeader>
            <CardTitle>Scheduler</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Last run</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Output</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).map((job) => (
                  <TableRow key={job.name}>
                    <TableCell className="font-medium">{job.name}</TableCell>
                    <TableCell>
                      <code className="text-xs">{job.schedule}</code>
                    </TableCell>
                    <TableCell>{formatWhen(job.lastRun)}</TableCell>
                    <TableCell>
                      {job.durationSec == null ? "—" : `${job.durationSec}s`}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {job.output || "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge kind="job" value={job.status} />
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
