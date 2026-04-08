import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import { useEffect } from 'react'
import { safeParseMeResponse } from '../schemas/me'
import axios from 'axios'

function normalizeId(value: string) {
  return value.trim().toLowerCase()
}

export function ProfilePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const { data: me, isLoading, error: queryError } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get<unknown>('/me')
      const parsed = safeParseMeResponse(data)
      if (!parsed.success) {
        throw new Error('Unerwartete Antwort vom Server.')
      }
      return parsed.data
    },
  })

  useEffect(() => {
    if (axios.isAxiosError(queryError) && queryError.response?.status === 401) {
      logout()
      navigate('/login', { replace: true })
    }
  }, [queryError, logout, navigate])

  const errorMessage = queryError
    ? axios.isAxiosError(queryError) && queryError.response?.data
      ? String((queryError.response.data as { message?: string }).message ?? queryError.message)
      : queryError instanceof Error
        ? queryError.message
        : 'Die API konnte nicht erreicht werden.'
    : null

  const idsMatch =
    me && user
      ? normalizeId(me.userId) === normalizeId(user.id)
      : false
  const emailsMatch =
    me && user ? me.email.toLowerCase() === user.email.toLowerCase() : false
  const sessionAligned = Boolean(me && idsMatch && emailsMatch)

  return (
    <><div className="max-w-[640px]">
      <p className="m-0 mb-6 text-base leading-relaxed text-text text-left">
        Anzeigename und E-Mail sind im Client zwischengespeichert (Zustand + localStorage).
        Die API-Sitzung selbst befindet sich in einem HttpOnly-Cookie — vergleichen Sie dies mit dem
        Dashboard-Tab, der die Identität vom Server lädt.
      </p>

      <div className="p-5 px-[22px] rounded-xl border border-border bg-bg shadow-custom mb-5 text-left">
        <h2 className="text-[17px] m-0 mb-3.5 text-text-h">Sitzung</h2>
        {user ? (
          <dl className="m-0 grid grid-cols-[auto,1fr] gap-x-5 gap-y-2 text-sm">
            <dt className="m-0 text-text font-medium text-left">Benutzer-ID</dt>
            <dd className="m-0 text-text-h font-mono text-[13px] break-all">{user.id || '—'}</dd>
            <dt className="m-0 text-text font-medium text-left">E-Mail</dt>
            <dd className="m-0 text-text-h font-mono text-[13px] break-all">{user.email}</dd>
            {user.name ? (
              <>
                <dt className="m-0 text-text font-medium text-left">Name</dt>
                <dd className="m-0 text-text-h font-mono text-[13px] break-all">{user.name}</dd>
              </>
            ) : null}
          </dl>
        ) : (
          <p className="text-sm text-text m-3 mt-0">Kein Benutzer in der Sitzung.</p>
        )}
        {me && !isLoading ? (
          <>
            <dl className="m-0 grid grid-cols-[auto,1fr] gap-x-5 gap-y-2 text-sm">
              <dt className="m-0 text-text font-medium text-left">Benutzer-ID</dt>
              <dd className="m-0 text-text-h font-mono text-[13px] break-all">{me.userId}</dd>
              <dt className="m-0 text-text font-medium text-left">E-Mail</dt>
              <dd className="m-0 text-text-h font-mono text-[13px] break-all">{me.email}</dd>
            </dl>
            <p
              className={`inline-flex items-center gap-2 p-2 px-3 rounded-lg text-sm font-medium mt-4 ${sessionAligned
                ? 'text-[#166534] bg-[rgba(22,101,52,0.12)] border border-[rgba(22,101,52,0.35)] dark:text-[#86efac] dark:bg-[rgba(34,197,94,0.15)] dark:border-[#22c55e]'
                : 'text-[#a16207] bg-[rgba(161,98,7,0.12)] border border-[rgba(161,98,7,0.35)] dark:text-[#fde047] dark:bg-[rgba(234,179,8,0.15)] dark:border-[#eab308]'
                }`}
              role="status"
            >
              {sessionAligned
                ? 'Das Sitzungscookie ist gültig und stimmt mit dieser Browsersitzung überein.'
                : 'Die API hat geantwortet, aber die Benutzer-ID oder E-Mail weicht von der gespeicherten Sitzung ab (überprüfen Sie die API-Claims gegen den Client-Status).'}
            </p>
          </>
        ) : null}
        {errorMessage ? <p className="text-sm text-text-error m-3 mt-0">{errorMessage}</p> : null}
      </div>

    </div></>
  )
}
