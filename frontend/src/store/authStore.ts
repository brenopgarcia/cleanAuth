import { create } from 'zustand'
import api, { fetchCsrfToken } from '../lib/api'
import { safeParseMeResponse } from '../schemas/me'
import { safeParseAdminMeResponse } from '../schemas/adminMe'
import { type AuthUser } from '../schemas/login'

export type { AuthUser }

type AuthState = {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
  logout: () => Promise<void>
  bootstrap: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set) => ({
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
                role: parsed.data.role,
                perms: parsed.data.perms,
              },
            })
            return
          } else {
            // try admin session
          }
        } catch {
          // try admin session
        }

        try {
          const { data } = await api.get<unknown>('/admin/auth/me')
          const parsed = safeParseAdminMeResponse(data)
          if (parsed.success) {
            set({
              user: {
                id: parsed.data.adminId,
                email: parsed.data.email,
                role: parsed.data.role,
                perms: [],
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
        try {
          await api.post('/admin/auth/logout')
        } catch {
          /* ignore */
        }
        set({ user: null })
      },
}))
