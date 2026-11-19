import { apiFetch } from "./client"
import type {
  Activity,
  DailyStat,
  EngagementStat,
  Job,
  MultiCityRow,
  StreakRow,
  User,
} from "@/types"

import usersSeed from "./mock/users.json"
import activitiesSeed from "./mock/activities.json"
import caloriesSeed from "./mock/calories.json"
import streaksSeed from "./mock/streaks.json"
import multicitySeed from "./mock/multicity.json"
import engagementSeed from "./mock/engagement.json"
import jobsSeed from "./mock/jobs.json"

const USE_MOCK = String(import.meta.env.VITE_USE_MOCK).toLowerCase() === "true"

/** In-memory users for mock PATCH updates */
let mockUsers: User[] = structuredClone(usersSeed as User[])
const mockActivities = activitiesSeed as Activity[]
const mockCalories = caloriesSeed as DailyStat[]
const mockStreaks = streaksSeed as StreakRow[]
const mockMulticity = multicitySeed as MultiCityRow[]
const mockEngagement = engagementSeed as EngagementStat[]
const mockJobs = jobsSeed as Job[]

function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(data)), ms)
  })
}

export async function getUsers(): Promise<User[]> {
  if (USE_MOCK) return delay(mockUsers)
  return apiFetch<User[]>("/api/users")
}

export async function getActivities(
  userId: string,
  limit = 20
): Promise<Activity[]> {
  if (USE_MOCK) {
    const list = mockActivities
      .filter((a) => a.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      )
      .slice(0, limit)
    return delay(list)
  }
  return apiFetch<Activity[]>(
    `/api/users/${encodeURIComponent(userId)}/activities?limit=${limit}`
  )
}

export async function updateUser(
  id: string,
  patch: Partial<Pick<User, "goal" | "weightKg">> & {
    contact?: Partial<User["contact"]>
  }
): Promise<User> {
  if (USE_MOCK) {
    const idx = mockUsers.findIndex((u) => u._id === id)
    if (idx === -1) throw new Error(`User ${id} not found`)
    const current = mockUsers[idx]
    const next: User = {
      ...current,
      ...("goal" in patch ? { goal: patch.goal as string } : {}),
      ...("weightKg" in patch ? { weightKg: patch.weightKg as number } : {}),
      contact: {
        ...current.contact,
        ...(patch.contact ?? {}),
      },
      updatedAt: new Date().toISOString(),
    }
    mockUsers = [
      ...mockUsers.slice(0, idx),
      next,
      ...mockUsers.slice(idx + 1),
    ]
    return delay(next)
  }
  return apiFetch<User>(`/api/users/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  })
}

export async function getCalories(
  userId: string,
  from?: string,
  to?: string
): Promise<DailyStat[]> {
  if (USE_MOCK) {
    let list = mockCalories.filter((c) => c.userId === userId)
    if (from) list = list.filter((c) => c.day >= from)
    if (to) list = list.filter((c) => c.day <= to)
    list = list.sort((a, b) => a.day.localeCompare(b.day))
    return delay(list)
  }
  const params = new URLSearchParams({ userId })
  if (from) params.set("from", from)
  if (to) params.set("to", to)
  return apiFetch<DailyStat[]>(`/api/analytics/calories?${params}`)
}

export async function getLeaderboard(): Promise<StreakRow[]> {
  if (USE_MOCK) {
    return delay(
      [...mockStreaks].sort((a, b) => b.current - a.current)
    )
  }
  return apiFetch<StreakRow[]>("/api/streaks/leaderboard")
}

export async function getSchemaVariety(): Promise<Activity[]> {
  if (USE_MOCK) {
    return delay(
      [...mockActivities].sort(
        (a, b) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      )
    )
  }
  return apiFetch<Activity[]>("/api/schema-variety")
}

export async function getMultiCity(): Promise<MultiCityRow[]> {
  if (USE_MOCK) return delay(mockMulticity)
  return apiFetch<MultiCityRow[]>("/api/analytics/multi-city")
}

export async function getEngagement(): Promise<EngagementStat[]> {
  if (USE_MOCK) {
    return delay(
      [...mockEngagement].sort((a, b) => a.day.localeCompare(b.day))
    )
  }
  return apiFetch<EngagementStat[]>("/api/analytics/engagement")
}

export async function getJobs(): Promise<Job[]> {
  if (USE_MOCK) return delay(mockJobs)
  return apiFetch<Job[]>("/api/jobs")
}
