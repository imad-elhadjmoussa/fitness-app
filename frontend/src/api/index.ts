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

export async function login(
  email: string,
  password: string
): Promise<AuthPayload> {
  return apiData<AuthPayload>("/api/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ email, password }),
  })
}

export async function register(input: RegisterInput): Promise<AuthPayload> {
  return apiData<AuthPayload>("/api/users", {
    method: "POST",
    auth: false,
    body: JSON.stringify(input),
  })
}

export async function getMe(): Promise<User> {
  return apiData<User>("/api/auth/me")
}

export async function getUsers(role?: string): Promise<User[]> {
  const q = role ? `?role=${encodeURIComponent(role)}` : ""
  return apiData<User[]>(`/api/users${q}`)
}

export async function getUser(userId: string): Promise<User> {
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
  return apiData<User>(`/api/users/${encodeURIComponent(id)}/profile`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  })
}

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

export async function getActivities(
  userId: string,
  _limit = 20
): Promise<Activity[]> {
  const workouts = await apiData<Workout[]>(
    `/api/workouts/user/${encodeURIComponent(userId)}/recent`
  )
  return workouts.map(workoutToActivity)
}

export async function createWorkout(
  input: CreateWorkoutInput
): Promise<Workout> {
  return apiData<Workout>("/api/workouts", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function getCalories(
  userId: string,
  from?: string,
  to?: string
): Promise<DailyStat[]> {
  const activities = await getActivities(userId, 50)
  const map = new Map<string, number>()

  for (const activity of activities) {
    const day = activity.startedAt.slice(0, 10)
    map.set(day, (map.get(day) ?? 0) + (activity.calories || 0))
  }

  let rows = [...map.entries()].map(([day, totalCalories]) => ({
    userId,
    day,
    totalCalories,
  }))
  if (from) rows = rows.filter((row) => row.day >= from)
  if (to) rows = rows.filter((row) => row.day <= to)

  return rows.sort((a, b) => a.day.localeCompare(b.day))
}

export async function getLeaderboard(): Promise<StreakRow[]> {
  const users = await getUsers("athlete")
  return users.map((user) => ({
    userId: user._id,
    name: `${user.firstName} ${user.lastName}`.trim(),
    current: 0,
    longest: 0,
  }))
}

export async function getSchemaVariety(): Promise<Activity[]> {
  const users = await getUsers()
  const all: Activity[] = []

  for (const user of users.slice(0, 5)) {
    all.push(...await getActivities(user._id, 20))
  }

  return all.sort(
    (a, b) =>
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  )
}

export async function getMultiCity(): Promise<MultiCityRow[]> {
  return []
}

export async function getEngagement(): Promise<EngagementStat[]> {
  return []
}

export async function getJobs(): Promise<Job[]> {
  return []
}
