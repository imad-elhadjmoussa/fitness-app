export type Role = "athlete" | "coach" | "analyst"

export type FitnessGoal =
  | "weight_loss"
  | "muscle_gain"
  | "maintenance"
  | "endurance"
  | "general_fitness"

/** Backend user shape */
export interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: Role
  profile: {
    fitnessGoal?: FitnessGoal | string
    weight?: number
    contact?: { phone?: string; address?: string }
  }
  createdAt?: string
  updatedAt?: string
}

export interface GpsRoute {
  startLocation?: { latitude: number; longitude: number }
  endLocation?: { latitude: number; longitude: number }
  coordinates?: Array<{
    latitude: number
    longitude: number
    timestamp?: string
  }>
  distance?: number
  unit?: string
}

export interface HeartRate {
  average?: number
  maximum?: number
  measurements?: Array<{ time?: string; bpm: number }>
}

export interface WorkoutPhoto {
  url: string
  caption?: string
}

export interface DeviceInfo {
  device?: string
  model?: string
}

/** Backend workout log (flexible schema) */
export interface Workout {
  _id: string
  userId: string
  workoutType: string
  duration: number
  date: string
  gpsRoute?: GpsRoute
  heartRate?: HeartRate
  photos?: WorkoutPhoto[]
  photoCount?: number
  deviceInfo?: DeviceInfo
  city?: string
  calories?: number
  [extra: string]: unknown
}

export interface CreateWorkoutInput {
  userId: string
  workoutType: string
  duration: number
  date?: string
  city?: string
  calories?: number
  gpsRoute?: GpsRoute
  heartRate?: HeartRate
  photos?: WorkoutPhoto[]
  deviceInfo?: DeviceInfo
}

export interface RegisterInput {
  firstName: string
  lastName: string
  email: string
  password: string
  role?: Role
  profile?: {
    fitnessGoal?: FitnessGoal | string
    weight?: number
    contact?: { phone?: string; address?: string }
  }
}

export interface AuthPayload {
  token: string
  user: User
}

export interface ApiEnvelope<T> {
  success: boolean
  message?: string
  data: T
  count?: number
  error?: string
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

export interface ClusterMemberStatus {
  name: string
  state: string
  healthy: boolean
  lastAppliedAt?: string
}

export interface ReplicaSetStatus {
  name: string
  healthy: boolean
  primary: string | null
  healthyMembers: number
  totalMembers: number
  requiredForMajority: number
  members: ClusterMemberStatus[]
  error?: string
}

export interface ApiNodeStatus {
  name: string
  healthy: boolean
  uptimeSeconds?: number
  error?: string
}

export interface ClusterStatus {
  healthy: boolean
  router: boolean
  mongoVersion: string
  mongoUptimeSeconds: number
  activeConnections: number
  insertCommandsTotal: number
  shardCount: number
  writePolicy: string
  replicaSets: ReplicaSetStatus[]
  apiNodes: ApiNodeStatus[]
}

/** Normalized activity for UI cards */
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
  photoCount?: number
  heartRate?: HeartRate
  gpsRoute?: GpsRoute
  photoObjects?: WorkoutPhoto[]
  [extra: string]: unknown
}
