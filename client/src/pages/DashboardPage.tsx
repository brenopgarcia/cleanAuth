import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { safeParseMeResponse } from '../schemas/me'
import { useAuthStore } from '../store/authStore'

function normalizeId(value: string) {
  return value.trim().toLowerCase()
}

export function DashboardPage() {
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
    <div className="max-w-[640px]">
      <h1 className="text-[28px] -tracking-[0.03em] m-0 mb-3 text-left">Dashboard</h1>
      <p className="m-0 mb-6 text-base leading-relaxed text-text text-left">
        Dieses Dashboard ruft den geschützten Endpunkt{' '}
        <code className="font-mono inline-flex rounded-sm text-text-h text-[15px] leading-[1.35] p-1 px-2 bg-code-bg">GET /api/me</code> über das beim
        Login gesetzte HttpOnly-Sitzungscookie auf. Wenn die Antwort mit Ihrer
        Client-Sitzung übereinstimmt, ist die Authentifizierung end-to-end
        korrekt konfiguriert.
      </p>

      <div className="p-5 px-[22px] rounded-xl border border-border bg-bg shadow-custom mb-5 text-left">
        <h2 className="text-[17px] m-0 mb-3.5 text-text-h">API-Verifizierung</h2>
        {isLoading ? (
          <p className="text-sm text-text m-3 mt-0">Profil wird vom Server geladen…</p>
        ) : null}
        {errorMessage && !isLoading ? (
          <p className="inline-flex items-center gap-2 p-2 px-3 rounded-lg text-sm font-medium mt-1 text-error-text bg-error-bg border border-error-border" role="alert">
            {errorMessage}
          </p>
        ) : null}
        {me && !isLoading ? (
          <>
            <dl className="m-0 grid grid-cols-[auto,1fr] gap-x-5 gap-y-2 text-sm">
              <dt className="m-0 text-text font-medium text-left">Benutzer-ID</dt>
              <dd className="m-0 text-text-h font-mono text-[13px] break-all">{me.userId}</dd>
              <dt className="m-0 text-text font-medium text-left">E-Mail</dt>
              <dd className="m-0 text-text-h font-mono text-[13px] break-all">{me.email}</dd>
            </dl>
            <p
              className={`inline-flex items-center gap-2 p-2 px-3 rounded-lg text-sm font-medium mt-4 ${
                sessionAligned
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
      </div>
    </div>
  )
}

