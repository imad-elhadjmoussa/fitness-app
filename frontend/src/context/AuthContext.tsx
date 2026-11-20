import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { getMe, login as apiLogin, register as apiRegister } from "@/api"
import {
  clearAuthStorage,
  getStoredUserJson,
  getToken,
  setStoredUserJson,
  setToken,
} from "@/lib/auth-storage"
import type { RegisterInput, Role, User } from "@/types"

interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<User>
  register: (input: RegisterInput) => Promise<User>
  logout: () => void
  refreshUser: () => Promise<void>
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredUser(): User | null {
  try {
    const raw = getStoredUserJson()
    if (!raw) return null
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => readStoredUser())
  const [token, setTokenState] = useState<string | null>(() => getToken())
  const [isLoading, setIsLoading] = useState(true)

  const setUser = useCallback((next: User | null) => {
    setUserState(next)
    setStoredUserJson(next ? JSON.stringify(next) : null)
  }, [])

  const persistSession = useCallback(
    (nextToken: string, nextUser: User) => {
      setToken(nextToken)
      setTokenState(nextToken)
      setUser(nextUser)
    },
    [setUser]
  )

  const logout = useCallback(() => {
    clearAuthStorage()
    setTokenState(null)
    setUserState(null)
  }, [])

  const refreshUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null)
      return
    }
    try {
      const me = await getMe()
      setUser({ ...me, role: (me.role as Role) || "athlete" })
    } catch {
      logout()
    }
  }, [logout, setUser])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        if (getToken()) {
          await refreshUser()
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [refreshUser])

  useEffect(() => {
    const onLogout = () => logout()
    window.addEventListener("fitpulse:logout", onLogout)
    return () => window.removeEventListener("fitpulse:logout", onLogout)
  }, [logout])

  const login = useCallback(
    async (email: string, password: string) => {
      const payload = await apiLogin(email, password)
      persistSession(payload.token, {
        ...payload.user,
        role: payload.user.role || "athlete",
      })
      return payload.user
    },
    [persistSession]
  )

  const register = useCallback(
    async (input: RegisterInput) => {
      const payload = await apiRegister(input)
      persistSession(payload.token, {
        ...payload.user,
        role: payload.user.role || input.role || "athlete",
      })
      return payload.user
    },
    [persistSession]
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
      refreshUser,
      setUser,
    }),
    [user, token, isLoading, login, register, logout, refreshUser, setUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
