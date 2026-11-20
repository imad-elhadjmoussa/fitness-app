import type { Activity, User, Workout } from "@/types"

export function displayName(user: Pick<User, "firstName" | "lastName">): string {
  return `${user.firstName} ${user.lastName}`.trim()
}

export function goalLabel(goal?: string): string {
  if (!goal) return "—"
  return goal
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

/** Map a backend workout into the Activity view-model used by cards/tables */
export function workoutToActivity(w: Workout): Activity {
  const device =
    [w.deviceInfo?.device, w.deviceInfo?.model].filter(Boolean).join(" ") ||
    "device"

  const route: [number, number][] | undefined = w.gpsRoute?.coordinates?.map(
    (c) => [c.longitude, c.latitude]
  )

  const hrSeries = w.heartRate?.measurements?.map((m) => m.bpm)

  const photoUrls = Array.isArray(w.photos)
    ? w.photos.map((p) => (typeof p === "string" ? p : p.url)).filter(Boolean)
    : undefined

  return {
    _id: w._id,
    userId: String(w.userId),
    type: w.workoutType,
    startedAt: typeof w.date === "string" ? w.date : new Date(w.date).toISOString(),
    durationSec: Math.round(Number(w.duration) * 60),
    calories: typeof w.calories === "number" ? w.calories : 0,
    city: typeof w.city === "string" ? w.city : "—",
    deviceType: device,
    gps: route?.length ? { route } : undefined,
    hrSeries: hrSeries?.length ? hrSeries : undefined,
    photos: photoUrls?.length ? photoUrls : undefined,
    heartRate: w.heartRate,
    gpsRoute: w.gpsRoute,
    photoObjects: Array.isArray(w.photos)
      ? w.photos.filter((p): p is { url: string; caption?: string } =>
          typeof p === "object" && p !== null && "url" in p
        )
      : undefined,
  }
}

