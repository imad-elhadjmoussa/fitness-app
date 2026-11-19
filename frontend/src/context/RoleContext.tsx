import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useNavigate } from "react-router-dom"
import type { Role } from "@/types"
import {
  ATHLETE_USER_ID,
  defaultPathForRole,
  ROLE_DISPLAY_NAME,
} from "@/lib/roles"

const STORAGE_KEY = "fitpulse-role"

interface StoredRole {
  role: Role
  currentUserId: string
}

interface RoleContextValue {
  role: Role
  currentUserId: string
  displayName: string
  setRole: (role: Role) => void
  setCurrentUserId: (userId: string) => void
}

const RoleContext = createContext<RoleContextValue | null>(null)

function readStored(): StoredRole {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { role: "athlete", currentUserId: ATHLETE_USER_ID }
    const parsed = JSON.parse(raw) as Partial<StoredRole>
    const role: Role =
      parsed.role === "coach" || parsed.role === "analyst"
        ? parsed.role
        : "athlete"
    return {
      role,
      currentUserId:
        typeof parsed.currentUserId === "string"
          ? parsed.currentUserId
          : ATHLETE_USER_ID,
    }
  } catch {
    return { role: "athlete", currentUserId: ATHLETE_USER_ID }
  }
}

function persist(state: StoredRole) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore quota / private mode
  }
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [state, setState] = useState<StoredRole>(() => readStored())

  const setRole = useCallback(
    (role: Role) => {
      setState((prev) => {
        const next: StoredRole = {
          role,
          currentUserId:
            role === "athlete" ? ATHLETE_USER_ID : prev.currentUserId,
        }
        persist(next)
        return next
      })
      navigate(defaultPathForRole(role), { replace: true })
    },
    [navigate]
  )

  const setCurrentUserId = useCallback((userId: string) => {
    setState((prev) => {
      const next = { ...prev, currentUserId: userId }
      persist(next)
      return next
    })
  }, [])

  const value = useMemo<RoleContextValue>(
    () => ({
      role: state.role,
      currentUserId:
        state.role === "athlete" ? ATHLETE_USER_ID : state.currentUserId,
      displayName: ROLE_DISPLAY_NAME[state.role],
      setRole,
      setCurrentUserId,
    }),
    [state, setRole, setCurrentUserId]
  )

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error("useRole must be used within RoleProvider")
  return ctx
}
