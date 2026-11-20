import { useState, type FormEvent } from "react"
import { useQuery } from "@tanstack/react-query"
import { getClusterStatus } from "@/api"
import { ApiError } from "@/api/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${days}d ${hours}h ${minutes}m`
}

function Health({ healthy }: { healthy: boolean }) {
  return (
    <span
      className={
        healthy
          ? "rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
          : "rounded-full bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive"
      }
    >
      {healthy ? "Healthy" : "Degraded"}
    </span>
  )
}

export function ClusterMonitorPage() {
  const [adminKey, setAdminKey] = useState("")
  const [activeKey, setActiveKey] = useState("")
  const cluster = useQuery({
    queryKey: ["admin-cluster", activeKey],
    queryFn: () => getClusterStatus(activeKey),
    enabled: Boolean(activeKey),
    refetchInterval: 10000,
    retry: false,
  })

  const submitKey = (event: FormEvent) => {
    event.preventDefault()
    setActiveKey(adminKey.trim())
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="page-title">Cluster monitor</h1>
          <p className="page-subtitle">
            Shards, replica-set availability, API nodes, and write throughput.
            Refreshes every 10 seconds.
          </p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Secure monitoring access</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={submitKey}>
            <div className="flex-1 space-y-2">
              <Label htmlFor="admin-key">Admin API key</Label>
              <Input
                id="admin-key"
                type="password"
                autoComplete="off"
                value={adminKey}
                onChange={(event) => setAdminKey(event.target.value)}
                placeholder="Enter the configured admin key"
                required
              />
            </div>
            <Button type="submit" disabled={!adminKey.trim()}>
              {activeKey ? "Update key" : "Connect"}
            </Button>
            {activeKey ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setActiveKey("")
                  setAdminKey("")
                }}
              >
                Disconnect
              </Button>
            ) : null}
          </form>
          {cluster.isError ? (
            <p className="mt-3 text-sm text-destructive">
              {cluster.error instanceof ApiError && cluster.error.status === 403
                ? "The backend rejected this key. Check that ADMIN_API_KEY in backend/.env matches, then restart the backend."
                : cluster.error instanceof Error
                ? cluster.error.message
                : "Could not load cluster status"}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {cluster.isLoading && activeKey ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : null}

      {cluster.data ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader><CardTitle>Cluster health</CardTitle></CardHeader>
              <CardContent><Health healthy={cluster.data.healthy} /></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Shards</CardTitle></CardHeader>
              <CardContent className="text-2xl font-semibold">{cluster.data.shardCount}</CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Insert commands</CardTitle></CardHeader>
              <CardContent className="text-2xl font-semibold">
                {cluster.data.insertCommandsTotal.toLocaleString()}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Active connections</CardTitle></CardHeader>
              <CardContent className="text-2xl font-semibold">{cluster.data.activeConnections}</CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>MongoDB router</CardTitle></CardHeader>
            <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
              <p>Router: <Health healthy={cluster.data.router} /></p>
              <p>MongoDB version: {cluster.data.mongoVersion}</p>
              <p>Uptime: {formatUptime(cluster.data.mongoUptimeSeconds)}</p>
              <p>Write policy: {cluster.data.writePolicy}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>API instances</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {cluster.data.apiNodes.map((node) => (
                <div key={node.name} className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 py-2 last:border-0">
                  <span className="font-medium">{node.name}</span>
                  <span className="flex items-center gap-3">
                    {node.uptimeSeconds != null ? formatUptime(node.uptimeSeconds) : node.error}
                    <Health healthy={node.healthy} />
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Replica sets</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              {cluster.data.replicaSets.map((replicaSet) => (
                <section key={replicaSet.name} className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-semibold">{replicaSet.name}</h2>
                    <Health healthy={replicaSet.healthy} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {replicaSet.healthyMembers}/{replicaSet.totalMembers} members available
                    {" · "}majority required: {replicaSet.requiredForMajority}
                    {" · "}primary: {replicaSet.primary ?? "none"}
                  </p>
                  {replicaSet.error ? (
                    <p className="text-sm text-destructive">{replicaSet.error}</p>
                  ) : null}
                  {replicaSet.members.map((member) => (
                    <div key={member.name} className="flex items-center justify-between gap-2 pl-3 text-sm">
                      <span>{member.name}</span>
                      <span className="flex items-center gap-2">
                        {member.state}
                        <Health healthy={member.healthy} />
                      </span>
                    </div>
                  ))}
                </section>
              ))}
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            MongoDB elects a primary automatically. Ingestion uses retryable writes
            with majority acknowledgement; a replica set needs a voting majority to
            accept writes.
          </p>
        </>
      ) : null}
    </div>
  )
}
