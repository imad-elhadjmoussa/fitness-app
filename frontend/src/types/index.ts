export interface User {
  _id: string
  name: string
  goal: string
  weightKg: number
  contact: { email: string; phone: string }
  streak: { current: number; longest: number; lastActiveDate?: string }
  updatedAt?: string
}

/** Common fields always present. Optional blocks ONLY if the device provides them. */
export interface Activity {
  _id: string
  userId: string
  type: string
  startedAt: string
  durationSec: number
  calories: number
  city: string
  deviceType: string
  schemaVersion?: number
  gps?: { route: [number, number][] }
  hrSeries?: number[]
  photos?: string[]
  [extra: string]: unknown
}

export interface DailyStat {
  userId: string
  day: string
  totalCalories: number
}

export interface StreakRow {
  userId: string
  name: string
  current: number
  longest: number
}

export interface MultiCityRow {
  userId: string
  cityA: string
  timeA: string
  cityB: string
  timeB: string
  gapHours: number
}

export interface EngagementStat {
  day: string
  activeUsers: number
}

export interface Job {
  name: string
  schedule: string
  lastRun: string
  durationSec: number | null
  output: string
  status: "success" | "retrying" | "failed"
}

export type Role = "athlete" | "coach" | "analyst"
