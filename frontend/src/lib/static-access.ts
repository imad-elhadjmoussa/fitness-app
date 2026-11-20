import type { Role, User } from "@/types"

export const STATIC_TOKEN = "fitpulse-static-session"

export const STATIC_ACCOUNTS: Array<{
  email: string
  password: string
  user: User
}> = [
  {
    email: "coach@fitpulse.app",
    password: "coach123",
    user: {
      _id: "static-coach-1",
      firstName: "Sarah",
      lastName: "Coach",
      email: "coach@fitpulse.app",
      role: "coach",
      profile: { fitnessGoal: "general_fitness" },
    },
  },
  {
    email: "analyst@fitpulse.app",
    password: "analyst123",
    user: {
      _id: "static-analyst-1",
      firstName: "Alex",
      lastName: "Analyst",
      email: "analyst@fitpulse.app",
      role: "analyst",
      profile: { fitnessGoal: "general_fitness" },
    },
  },
]

export function staticLogin(
  email: string,
  password: string
): User | null {
  const account = STATIC_ACCOUNTS.find(
    (item) =>
      item.email === email.trim().toLowerCase() &&
      item.password === password
  )
  return account?.user ?? null
}

export function isStaticRole(role?: Role): role is "coach" | "analyst" {
  return role === "coach" || role === "analyst"
}
