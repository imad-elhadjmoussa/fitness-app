import { getToken, clearAuthStorage } from "@/lib/auth-storage"
import type { ApiEnvelope } from "@/types"

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? ""

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { auth?: boolean }
): Promise<T> {
  const { auth = true, headers, ...rest } = init ?? {}
  const token = getToken()

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
  })

  let body: unknown = null
  const text = await res.text()
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = text
    }
  }

  if (res.status === 401) {
    clearAuthStorage()
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("fitpulse:logout"))
    }
  }

  if (!res.ok) {
    const message =
      typeof body === "object" &&
      body &&
      "message" in body &&
      typeof (body as { message: unknown }).message === "string"
        ? (body as { message: string }).message
        : `Request failed (${res.status})`
    throw new ApiError(message, res.status)
  }

  return body as T
}

/** Unwrap `{ success, data }` envelopes from the FitPulse API */
export async function apiData<T>(
  path: string,
  init?: RequestInit & { auth?: boolean }
): Promise<T> {
  const envelope = await apiFetch<ApiEnvelope<T> | T>(path, init)

  if (
    envelope &&
    typeof envelope === "object" &&
    "data" in envelope &&
    "success" in envelope
  ) {
    return (envelope as ApiEnvelope<T>).data
  }

  return envelope as T
}
