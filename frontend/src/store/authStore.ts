import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api, { fetchCsrfToken } from '../lib/api'
import { safeParseMeResponse } from '../schemas/me'
import { type AuthUser } from '../schemas/login'

export type { AuthUser }

type AuthState = {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
  logout: () => Promise<void>
  bootstrap: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,

      setUser: (user) => set({ user }),

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

      logout: async () => {
        try {
          await api.post('/auth/logout')
        } catch {
          /* still clear client state if cookie expired or network failed */
        }
        set({ user: null })
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
