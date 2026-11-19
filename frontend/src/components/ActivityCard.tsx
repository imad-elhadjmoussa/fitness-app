import { useState } from "react"
import { ChevronDown, ChevronRight, Clock, Flame, MapPin, Watch } from "lucide-react"
import type { Activity } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return s ? `${m}m ${s}s` : `${m}m`
}

function formatWhen(iso: string): string {
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

const KNOWN = new Set([
  "_id",
  "userId",
  "type",
  "startedAt",
  "durationSec",
  "calories",
  "city",
  "deviceType",
  "schemaVersion",
  "gps",
  "hrSeries",
  "photos",
])

interface ActivityCardProps {
  activity: Activity
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const [open, setOpen] = useState(false)
  const hasGps = Boolean(activity.gps)
  const hasHr = Array.isArray(activity.hrSeries) && activity.hrSeries.length > 0
  const photoCount = Array.isArray(activity.photos) ? activity.photos.length : 0
  const durationOnly = !hasGps && !hasHr && photoCount === 0

  const extras = Object.keys(activity).filter((k) => !KNOWN.has(k))

  return (
    <Card size="sm">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle className="capitalize">{activity.type}</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatWhen(activity.startedAt)}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-1">
          {hasGps ? <Badge variant="outline">GPS route</Badge> : null}
          {hasHr ? <Badge variant="outline">Heart rate</Badge> : null}
          {photoCount > 0 ? (
            <Badge variant="outline">
              {photoCount} photo{photoCount === 1 ? "" : "s"}
            </Badge>
          ) : null}
          {durationOnly ? (
            <Badge variant="secondary">duration only</Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" />
            {formatDuration(activity.durationSec)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Flame className="size-3.5" />
            {activity.calories} kcal
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" />
            {activity.city}
          </span>
          <span className="inline-flex items-center gap-1">
            <Watch className="size-3.5" />
            {activity.deviceType}
          </span>
        </div>

        <div>
          <Button
            variant="ghost"
            size="xs"
            className="px-0 text-muted-foreground"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <ChevronDown data-icon="inline-start" />
            ) : (
              <ChevronRight data-icon="inline-start" />
            )}
            Raw document
            {extras.length > 0 ? (
              <span className="text-xs">({extras.length} extra)</span>
            ) : null}
          </Button>
          {open ? (
            <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-muted p-3 text-xs">
              {JSON.stringify(activity, null, 2)}
            </pre>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
