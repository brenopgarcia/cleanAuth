import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retryAfterRefresh?: boolean
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

function isAuthExemptUrl(url: string | undefined): boolean {
  if (!url) return true
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh') ||
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

api.interceptors.request.use((config) => {
  const method = (config.method ?? 'get').toLowerCase()
  if (
    xsrfToken &&
    !['get', 'head', 'options', 'trace'].includes(method)
  ) {
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
