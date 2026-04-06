import { useAuthStore } from '../store/authStore'
import './LoggedPage.css'

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="logged-page">
      <h1>Profile</h1>
      <p className="logged-lead">
        Display name and email cached in the client (Zustand + localStorage).
        The API session itself lives in an HttpOnly cookie — compare with the
        Dashboard tab, which loads identity from the server.
      </p>

      <div className="logged-card">
        <h2>Session</h2>
        {user ? (
          <dl className="logged-dl">
            <dt>User id</dt>
            <dd>{user.id || '—'}</dd>
            <dt>Email</dt>
            <dd>{user.email}</dd>
            {user.name ? (
              <>
                <dt>Name</dt>
                <dd>{user.name}</dd>
              </>
            ) : null}
          </dl>
        ) : (
          <p className="logged-muted">No user in session.</p>
        )}
      </div>
    </div>
  )
}
