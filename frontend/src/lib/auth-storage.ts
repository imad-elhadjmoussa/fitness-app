const TOKEN_KEY = "fitpulse-token"
const USER_KEY = "fitpulse-user"

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // ignore
  }
}

export function getStoredUserJson(): string | null {
  try {
    return localStorage.getItem(USER_KEY)
  } catch {
    return null
  }
}

export function setStoredUserJson(json: string | null) {
  try {
    if (json) localStorage.setItem(USER_KEY, json)
    else localStorage.removeItem(USER_KEY)
  } catch {
    // ignore
  }
}

export function clearAuthStorage() {
  setToken(null)
  setStoredUserJson(null)
}
