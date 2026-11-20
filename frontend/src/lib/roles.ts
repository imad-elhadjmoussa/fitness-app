import type { Role } from "@/types"

export const ROLE_LABELS: Record<Role, string> = {
  athlete: "Athlete",
  coach: "Coach",
  analyst: "Analyst / Admin",
}

export const FITNESS_GOALS = [
  { value: "weight_loss", label: "Weight loss" },
  { value: "muscle_gain", label: "Muscle gain" },
  { value: "maintenance", label: "Maintenance" },
  { value: "endurance", label: "Endurance" },
  { value: "general_fitness", label: "General fitness" },
] as const

export const WORKOUT_TYPES = [
  "running",
  "cycling",
  "weightlifting",
  "yoga",
  "hiit",
  "walking",
  "swimming",
  "other",
] as const

export type NavItem = { to: string; label: string }

export const ROLE_NAV: Record<Role, NavItem[]> = {
  athlete: [
    { to: "/timeline", label: "Timeline" },
    { to: "/workouts/new", label: "Log workout" },
    { to: "/calories", label: "Calories" },
    { to: "/streak", label: "Streak" },
    { to: "/profile", label: "Profile" },
  ],
  coach: [
    { to: "/clients", label: "Clients" },
    { to: "/timeline", label: "Timeline" },
    { to: "/calories", label: "Calories" },
  ],
  analyst: [
    { to: "/engagement", label: "Engagement" },
    { to: "/multi-city", label: "Multi-city" },
    { to: "/schema-variety", label: "Schema variety" },
    { to: "/jobs", label: "Jobs" },
  ],
}

export function defaultPathForRole(role: Role): string {
  return ROLE_NAV[role][0].to
}

export function isPathAllowed(role: Role, pathname: string): boolean {
  return ROLE_NAV[role].some(
    (item) => pathname === item.to || pathname.startsWith(`${item.to}/`)
  )
}
