import axios from 'axios'
import type { ZodError } from 'zod'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api, { fetchCsrfToken } from '../lib/api'
import {
  authUserFromSession,
  loginRequestSchema,
  safeParseAuthSessionResponse,
  type AuthUser,
} from '../schemas/login'
import {
  registerRequestSchema,
  safeParseRegisterResponse,
} from '../schemas/register'
import { safeParseMeResponse } from '../schemas/me'

export type { AuthUser }

type AuthState = {
  user: AuthUser | null
  error: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (
    email: string,
    password: string,
    userName?: string,
  ) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  bootstrap: () => Promise<void>
}

function zodIssueMessage(err: ZodError): string {
  const flat = err.flatten()
  const field = Object.values(flat.fieldErrors).flat()[0]
  if (field) return field
  return flat.formErrors[0] ?? 'Validation failed.'
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      error: null,
      isLoading: false,

      clearError: () => set({ error: null }),

      bootstrap: async () => {
        await fetchCsrfToken()
        try {
          const { data } = await api.get<unknown>('/me')
          const parsed = safeParseMeResponse(data)
          if (parsed.success) {
            set({
              user: {
                id: parsed.data.userId,
                email: parsed.data.email,
              },
            })
          } else {
            set({ user: null })
          }
        } catch {
          set({ user: null })
        }
      },

      login: async (email, password) => {
        set({ error: null, isLoading: true })

        const body = loginRequestSchema.safeParse({ email, password })
        if (!body.success) {
          set({ error: zodIssueMessage(body.error), isLoading: false })
          return
        }

        try {
          const { data } = await api.post<unknown>('/auth/login', body.data)
          const parsed = safeParseAuthSessionResponse(data)
          if (!parsed.success) {
            set({ error: zodIssueMessage(parsed.error), isLoading: false })
            return
          }

          set({
            user: authUserFromSession(parsed.data),
            isLoading: false,
          })
        } catch (err: unknown) {
          const message =
            axios.isAxiosError(err) && err.response?.data
              ? String(
                  (err.response.data as { message?: string }).message ??
                    (err.response.data as { error?: string }).error ??
                    err.message,
                )
              : err instanceof Error
                ? err.message
                : 'Login failed.'
          set({ error: message, isLoading: false })
          throw err
        }
      },

      register: async (email, password, userName) => {
        set({ error: null, isLoading: true })

        const body = registerRequestSchema.safeParse({
          email,
          password,
          userName: userName ?? undefined,
        })
        if (!body.success) {
          set({ error: zodIssueMessage(body.error), isLoading: false })
          return
        }

        const payload: {
          email: string
          password: string
          userName?: string
        } = {
          email: body.data.email,
          password: body.data.password,
        }
        if (body.data.userName?.length) {
          payload.userName = body.data.userName
        }

        try {
          const { data } = await api.post<unknown>(
            '/auth/register',
            payload,
          )
          const parsed = safeParseRegisterResponse(data)
          if (!parsed.success) {
            set({ error: zodIssueMessage(parsed.error), isLoading: false })
            return
          }

          let resolvedUser = authUserFromSession(parsed.data)
          if (body.data.userName) {
            resolvedUser = { ...resolvedUser, name: body.data.userName }
          }

          set({
            user: resolvedUser,
            isLoading: false,
          })
        } catch (err: unknown) {
          const message =
            axios.isAxiosError(err) && err.response?.data
              ? String(
                  (err.response.data as { message?: string }).message ??
                    (err.response.data as { error?: string }).error ??
                    err.message,
                )
              : err instanceof Error
                ? err.message
                : 'Registration failed.'
          set({ error: message, isLoading: false })
          throw err
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout')
        } catch {
          /* still clear client state if cookie expired or network failed */
        }
        set({ user: null, error: null })
      },
    }),
    {
      name: 'auth-session',
      partialize: (state) => ({
        user: state.user,
      }),
    },
  ),
)
