import axios from 'axios'
import { useEffect, useState } from 'react'
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

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [me, setMe] = useState<{ userId: string; email: string } | null>(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      setLoading(true)
      setError(null)
      try {
        const { data } = await api.get<unknown>('/me')
        if (cancelled) return
        const parsed = safeParseMeResponse(data)
        if (!parsed.success) {
          setError('Unexpected response from the server.')
          setMe(null)
          return
        }
        setMe(parsed.data)
      } catch (err: unknown) {
        if (cancelled) return
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          logout()
          navigate('/login', { replace: true })
          return
        }
        const message =
          axios.isAxiosError(err) && err.response?.data
            ? String(
                (err.response.data as { message?: string }).message ??
                  err.message,
              )
            : err instanceof Error
              ? err.message
              : 'Could not reach the API.'
        setError(message)
        setMe(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [logout, navigate])

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
        This screen calls the protected endpoint{' '}
        <code className="font-mono inline-flex rounded-sm text-text-h text-[15px] leading-[1.35] p-1 px-2 bg-code-bg">GET /api/me</code> using the HttpOnly
        session cookie set at login. If the response matches your client
        session, auth is wired correctly end-to-end.
      </p>

      <div className="p-5 px-[22px] rounded-xl border border-border bg-bg shadow-custom mb-5 text-left">
        <h2 className="text-[17px] m-0 mb-3.5 text-text-h">API verification</h2>
        {loading ? (
          <p className="text-sm text-text m-3 mt-0">Loading profile from the server…</p>
        ) : null}
        {error && !loading ? (
          <p className="inline-flex items-center gap-2 p-2 px-3 rounded-lg text-sm font-medium mt-1 text-error-text bg-error-bg border border-error-border" role="alert">
            {error}
          </p>
        ) : null}
        {me && !loading ? (
          <>
            <dl className="m-0 grid grid-cols-[auto,1fr] gap-x-5 gap-y-2 text-sm">
              <dt className="m-0 text-text font-medium text-left">userId</dt>
              <dd className="m-0 text-text-h font-mono text-[13px] break-all">{me.userId}</dd>
              <dt className="m-0 text-text font-medium text-left">email</dt>
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
                ? 'Session cookie is valid and matches this browser session.'
                : 'API responded, but user id or email differs from the stored session (check API claims vs client state).'}
            </p>
          </>
        ) : null}
      </div>
    </div>
  )
}

