import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retryAfterRefresh?: boolean
    _retryAfterCsrf?: boolean
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

let xsrfToken: string | null = null

/** Call once at startup (and after hard navigation if needed) before unsafe HTTP methods. */
export async function fetchCsrfToken(): Promise<void> {
  const { data } = await api.get<{ token?: string }>('/antiforgery/token')
  xsrfToken = typeof data?.token === 'string' ? data.token : null
}

export function isAuthExemptUrl(url: string | undefined): boolean {
  if (!url) {
    return true
  }
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh') ||
    url.includes('/admin/auth/') ||
    url.includes('/antiforgery/token')
  )
}

let refreshPromise: Promise<void> | null = null

function refreshSession(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = api
      .post('/auth/refresh')
      .then(() => {})
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

export function isUnsafeMethod(method: string | undefined): boolean {
  const normalized = (method ?? 'get').toLowerCase()
  return !['get', 'head', 'options', 'trace'].includes(normalized)
}

export function isLikelyCsrfError(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object') {
    return false
  }

  const data = payload as { message?: unknown; error?: unknown; title?: unknown }
  const joined = [data.message, data.error, data.title]
    .filter((v) => typeof v === 'string')
    .join(' ')
    .toLowerCase()
  return joined.includes('csrf') || joined.includes('antiforgery')
}

api.interceptors.request.use(async (config) => {
  if (isUnsafeMethod(config.method) && !xsrfToken) {
    try {
      await fetchCsrfToken()
    } catch {
      // continue; server may still accept request depending on endpoint policy
    }
  }

  if (xsrfToken && isUnsafeMethod(config.method)) {
    config.headers['X-XSRF-TOKEN'] = xsrfToken
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const original = axios.isAxiosError(error)
      ? (error.config as InternalAxiosRequestConfig | undefined)
      : undefined

    if (
      axios.isAxiosError(error) &&
      original &&
      !original._retryAfterCsrf &&
      isUnsafeMethod(original.method) &&
      (error.response?.status === 400 || error.response?.status === 403) &&
      isLikelyCsrfError(error.response?.data)
    ) {
      original._retryAfterCsrf = true
      await fetchCsrfToken()
      return api.request(original)
    }

    if (
      !axios.isAxiosError(error) ||
      error.response?.status !== 401 ||
      !original ||
      original._retryAfterRefresh ||
      isAuthExemptUrl(original.url)
    ) {
      return Promise.reject(error)
    }

    original._retryAfterRefresh = true
    try {
      await refreshSession()
      return api.request(original)
    } catch {
      return Promise.reject(error)
    }
  },
)

export default api
