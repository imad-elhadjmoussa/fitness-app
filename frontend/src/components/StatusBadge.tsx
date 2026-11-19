import { Badge } from "@/components/ui/badge"
import type { Job } from "@/types"

type ClientStatus = "On track" | "Needs a nudge"

interface StatusBadgeProps {
  kind: "client" | "job"
  value: ClientStatus | Job["status"]
}

export function StatusBadge({ kind, value }: StatusBadgeProps) {
  if (kind === "client") {
    const onTrack = value === "On track"
    return (
      <Badge variant={onTrack ? "default" : "secondary"}>
        {value}
      </Badge>
    )
  }

  const map: Record<
    Job["status"],
    { label: string; variant: "default" | "secondary" | "destructive" }
  > = {
    success: { label: "Success", variant: "default" },
    retrying: { label: "Retrying", variant: "secondary" },
    failed: { label: "Failed", variant: "destructive" },
  }

  const meta = map[value as Job["status"]]
  return <Badge variant={meta.variant}>{meta.label}</Badge>
}
