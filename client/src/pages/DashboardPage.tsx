import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { safeParseMeResponse } from '../schemas/me'
import { useAuthStore } from '../store/authStore'
import './LoggedPage.css'

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
    <div className="logged-page">
      <h1>Dashboard</h1>
      <p className="logged-lead">
        This screen calls the protected endpoint{' '}
        <code className="logged-code">GET /api/me</code> using the HttpOnly
        session cookie set at login. If the response matches your client
        session, auth is wired correctly end-to-end.
      </p>

      <div className="logged-card">
        <h2>API verification</h2>
        {loading ? (
          <p className="logged-muted">Loading profile from the server…</p>
        ) : null}
        {error && !loading ? (
          <p className="logged-status logged-status--err" role="alert">
            {error}
          </p>
        ) : null}
        {me && !loading ? (
          <>
            <dl className="logged-dl">
              <dt>userId</dt>
              <dd>{me.userId}</dd>
              <dt>email</dt>
              <dd>{me.email}</dd>
            </dl>
            <p
              className={`logged-status ${
                sessionAligned
                  ? 'logged-status--ok'
                  : 'logged-status--warn'
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
