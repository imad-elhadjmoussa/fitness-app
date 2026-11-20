import { apiData } from "./client"
import { workoutToActivity } from "@/lib/mappers"
import type {
  Activity,
  AuthPayload,
  CreateWorkoutInput,
  DailyStat,
  EngagementStat,
  Job,
  MultiCityRow,
  RegisterInput,
  StreakRow,
  User,
  Workout,
} from "@/types"

import usersSeed from "./mock/users.json"
import activitiesSeed from "./mock/activities.json"
import caloriesSeed from "./mock/calories.json"
import streaksSeed from "./mock/streaks.json"
import multicitySeed from "./mock/multicity.json"
import engagementSeed from "./mock/engagement.json"
import jobsSeed from "./mock/jobs.json"

const USE_MOCK = String(import.meta.env.VITE_USE_MOCK).toLowerCase() === "true"

/** Legacy mock users adapted to the new User shape */
type LegacyMockUser = {
  _id: string
  name: string
  goal: string
  weightKg: number
  contact: { email: string; phone: string }
  streak: { current: number; longest: number; lastActiveDate?: string }
  updatedAt?: string
}

function legacyToUser(u: LegacyMockUser, role: User["role"] = "athlete"): User {
  const [firstName, ...rest] = u.name.split(" ")
  return {
    _id: u._id,
    firstName: firstName || "User",
    lastName: rest.join(" ") || "",
    email: u.contact.email,
    role,
    profile: {
      fitnessGoal: u.goal.toLowerCase().includes("marathon")
        ? "endurance"
        : u.goal.toLowerCase().includes("weight")
          ? "weight_loss"
          : u.goal.toLowerCase().includes("muscle")
            ? "muscle_gain"
            : "general_fitness",
      weight: u.weightKg,
      contact: { phone: u.contact.phone, address: "" },
    },
    updatedAt: u.updatedAt,
  }
}

let mockUsers: User[] = (usersSeed as LegacyMockUser[]).map((u, i) =>
  legacyToUser(u, i === 0 ? "athlete" : "athlete")
)
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

// —— Auth ——

export async function login(
  email: string,
  password: string
): Promise<AuthPayload> {
  if (USE_MOCK) {
    const user =
      mockUsers.find((u) => u.email === email) ??
      ({
        _id: "u1",
        firstName: "Amine",
        lastName: "B.",
        email,
        role: "athlete" as const,
        profile: {
          fitnessGoal: "endurance",
          weight: 72,
          contact: { phone: "+213555100001" },
        },
      } satisfies User)
    return delay({ token: "mock-token", user })
  }
  return apiData<AuthPayload>("/api/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ email, password }),
  })
}

export async function register(input: RegisterInput): Promise<AuthPayload> {
  if (USE_MOCK) {
    const user: User = {
      _id: `u${Date.now()}`,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      role: input.role ?? "athlete",
      profile: input.profile ?? { fitnessGoal: "general_fitness" },
    }
    mockUsers = [user, ...mockUsers]
    return delay({ token: "mock-token", user })
  }
  return apiData<AuthPayload>("/api/users", {
    method: "POST",
    auth: false,
    body: JSON.stringify(input),
  })
}

export async function getMe(): Promise<User> {
  if (USE_MOCK) {
    return delay(mockUsers[0])
  }
  return apiData<User>("/api/auth/me")
}

// —— Users ——

export async function getUsers(role?: string): Promise<User[]> {
  if (USE_MOCK) return delay(mockUsers)
  const q = role ? `?role=${encodeURIComponent(role)}` : ""
  return apiData<User[]>(`/api/users${q}`)
}

export async function getUser(userId: string): Promise<User> {
  if (USE_MOCK) {
    const user = mockUsers.find((u) => u._id === userId)
    if (!user) throw new Error("User not found")
    return delay(user)
  }
  return apiData<User>(`/api/users/${encodeURIComponent(userId)}`)
}

export async function updateUserProfile(
  id: string,
  patch: {
    fitnessGoal?: string
    weight?: number
    contact?: { phone?: string; address?: string }
  }
): Promise<User> {
  if (USE_MOCK) {
    const idx = mockUsers.findIndex((u) => u._id === id)
    if (idx === -1) throw new Error(`User ${id} not found`)
    const current = mockUsers[idx]
    const next: User = {
      ...current,
      profile: {
        ...current.profile,
        ...(patch.fitnessGoal !== undefined
          ? { fitnessGoal: patch.fitnessGoal }
          : {}),
        ...(patch.weight !== undefined ? { weight: patch.weight } : {}),
        contact: {
          ...current.profile.contact,
          ...(patch.contact ?? {}),
        },
      },
      updatedAt: new Date().toISOString(),
    }
    mockUsers = [...mockUsers.slice(0, idx), next, ...mockUsers.slice(idx + 1)]
    return delay(next)
  }
  return apiData<User>(`/api/users/${encodeURIComponent(id)}/profile`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  })
}

/** @deprecated use updateUserProfile — kept for older hooks */
export async function updateUser(
  id: string,
  patch: {
    goal?: string
    weightKg?: number
    contact?: { email?: string; phone?: string }
  }
): Promise<User> {
  return updateUserProfile(id, {
    ...(patch.goal ? { fitnessGoal: patch.goal } : {}),
    ...(patch.weightKg !== undefined ? { weight: patch.weightKg } : {}),
    ...(patch.contact?.phone
      ? { contact: { phone: patch.contact.phone } }
      : {}),
  })
}

// —— Workouts / activities ——

export async function getActivities(
  userId: string,
  _limit = 20
): Promise<Activity[]> {
  if (USE_MOCK) {
    const list = mockActivities
      .filter((a) => a.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      )
      .slice(0, _limit)
    return delay(list)
  }
  const workouts = await apiData<Workout[]>(
    `/api/workouts/user/${encodeURIComponent(userId)}/recent`
  )
  return workouts.map(workoutToActivity)
}

export async function createWorkout(
  input: CreateWorkoutInput
): Promise<Workout> {
  if (USE_MOCK) {
    const activity: Activity = {
      _id: `a${Date.now()}`,
      userId: input.userId,
      type: input.workoutType,
      startedAt: input.date ?? new Date().toISOString(),
      durationSec: Math.round(input.duration * 60),
      calories: input.calories ?? 0,
      city: input.city ?? "—",
      deviceType: input.deviceInfo?.device ?? "phone",
      gps: input.gpsRoute?.coordinates?.length
        ? {
            route: input.gpsRoute.coordinates.map((c) => [
              c.longitude,
              c.latitude,
            ]),
          }
        : undefined,
      hrSeries: input.heartRate?.measurements?.map((m) => m.bpm),
      photos: input.photos?.map((p) => p.url),
    }
    mockActivities.unshift(activity)
    return delay({
      ...input,
      _id: activity._id,
      date: activity.startedAt,
    } as Workout)
  }
  return apiData<Workout>("/api/workouts", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

// —— Analytics (mock only until backend adds them) ——

export async function getCalories(
  userId: string,
  from?: string,
  to?: string
): Promise<DailyStat[]> {
  if (!USE_MOCK) {
    // Derive a simple daily series from recent workouts when live
    const activities = await getActivities(userId, 50)
    const map = new Map<string, number>()
    for (const a of activities) {
      const day = a.startedAt.slice(0, 10)
      map.set(day, (map.get(day) ?? 0) + (a.calories || 0))
    }
    let rows = [...map.entries()].map(([day, totalCalories]) => ({
      userId,
      day,
      totalCalories,
    }))
    if (from) rows = rows.filter((r) => r.day >= from)
    if (to) rows = rows.filter((r) => r.day <= to)
    return rows.sort((a, b) => a.day.localeCompare(b.day))
  }
  let list = mockCalories.filter((c) => c.userId === userId)
  if (from) list = list.filter((c) => c.day >= from)
  if (to) list = list.filter((c) => c.day <= to)
  return delay(list.sort((a, b) => a.day.localeCompare(b.day)))
}

export async function getLeaderboard(): Promise<StreakRow[]> {
  if (!USE_MOCK) {
    try {
      const users = await getUsers("athlete")
      return users.map((u) => ({
        userId: u._id,
        name: `${u.firstName} ${u.lastName}`,
        current: 0,
        longest: 0,
      }))
    } catch {
      return []
    }
  }
  return delay([...mockStreaks].sort((a, b) => b.current - a.current))
}

export async function getSchemaVariety(): Promise<Activity[]> {
  if (!USE_MOCK) {
    // Coach/analyst: sample from listed athletes when possible
    try {
      const users = await getUsers()
      const all: Activity[] = []
      for (const u of users.slice(0, 5)) {
        const acts = await getActivities(u._id, 20)
        all.push(...acts)
      }
      return all.sort(
        (a, b) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      )
    } catch {
      return []
    }
  }
  return delay(
    [...mockActivities].sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    )
  )
}

export async function getMultiCity(): Promise<MultiCityRow[]> {
  if (!USE_MOCK) return []
  return delay(mockMulticity)
}

export async function getEngagement(): Promise<EngagementStat[]> {
  if (!USE_MOCK) return []
  return delay([...mockEngagement].sort((a, b) => a.day.localeCompare(b.day)))
}

export async function getJobs(): Promise<Job[]> {
  if (!USE_MOCK) return []
  return delay(mockJobs)
}

export { USE_MOCK }
