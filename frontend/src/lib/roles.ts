import type { Role } from "@/types"

export const ROLE_LABELS: Record<Role, string> = {
  athlete: "Athlete",
  coach: "Coach",
  analyst: "Analyst / Admin",
}

export const ROLE_DISPLAY_NAME: Record<Role, string> = {
  athlete: "Amine B.",
  coach: "Coach Meriem",
  analyst: "Admin",
}

export const ATHLETE_USER_ID = "u1"

export type NavItem = { to: string; label: string }

export const ROLE_NAV: Record<Role, NavItem[]> = {
  athlete: [
    { to: "/timeline", label: "Timeline" },
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
