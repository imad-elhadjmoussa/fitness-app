import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import type { Role } from "@/types"
import { defaultPathForRole } from "@/lib/roles"

interface RoleContextValue {
  role: Role
  currentUserId: string
  displayName: string
  setCurrentUserId: (userId: string) => void
}

const RoleContext = createContext<RoleContextValue | null>(null)
const CLIENT_KEY = "fitpulse-selected-client"

function readClientId(fallback: string): string {
  try {
    return localStorage.getItem(CLIENT_KEY) || fallback
  } catch {
    return fallback
  }
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const role: Role = user?.role ?? "athlete"
  const selfId = user?._id ?? ""

  const [currentUserId, setCurrentUserIdState] = useState(() =>
    readClientId(selfId)
  )

  useEffect(() => {
    if (!user) return
    if (user.role === "athlete") {
      setCurrentUserIdState(user._id)
    } else if (!currentUserId) {
      setCurrentUserIdState(readClientId(user._id))
    }
  }, [user, currentUserId])

  const setCurrentUserId = useCallback((userId: string) => {
    setCurrentUserIdState(userId)
    try {
      localStorage.setItem(CLIENT_KEY, userId)
    } catch {
      // ignore
    }
  }, [])

  // When role identity changes after login, land on the role home
  useEffect(() => {
    if (!user) return
    const path = defaultPathForRole(user.role || "athlete")
    if (window.location.pathname === "/login" || window.location.pathname === "/register") {
      navigate(path, { replace: true })
    }
  }, [user?._id, user?.role, navigate, user])

  const value = useMemo<RoleContextValue>(
    () => ({
      role,
      currentUserId: role === "athlete" ? selfId : currentUserId || selfId,
      displayName: user
        ? `${user.firstName} ${user.lastName}`.trim()
        : "Guest",
      setCurrentUserId,
    }),
    [role, selfId, currentUserId, user, setCurrentUserId]
  )

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error("useRole must be used within RoleProvider")
  return ctx
}
