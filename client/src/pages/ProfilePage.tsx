import { useAuthStore } from '../store/authStore'

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="max-w-[640px]">
      <h1 className="text-[28px] -tracking-[0.03em] m-0 mb-3 text-left">Profile</h1>
      <p className="m-0 mb-6 text-base leading-relaxed text-text text-left">
        Display name and email cached in the client (Zustand + localStorage).
        The API session itself lives in an HttpOnly cookie — compare with the
        Dashboard tab, which loads identity from the server.
      </p>

      <div className="p-5 px-[22px] rounded-xl border border-border bg-bg shadow-custom mb-5 text-left">
        <h2 className="text-[17px] m-0 mb-3.5 text-text-h">Session</h2>
        {user ? (
          <dl className="m-0 grid grid-cols-[auto,1fr] gap-x-5 gap-y-2 text-sm">
            <dt className="m-0 text-text font-medium text-left">User id</dt>
            <dd className="m-0 text-text-h font-mono text-[13px] break-all">{user.id || '—'}</dd>
            <dt className="m-0 text-text font-medium text-left">Email</dt>
            <dd className="m-0 text-text-h font-mono text-[13px] break-all">{user.email}</dd>
            {user.name ? (
              <>
                <dt className="m-0 text-text font-medium text-left">Name</dt>
                <dd className="m-0 text-text-h font-mono text-[13px] break-all">{user.name}</dd>
              </>
            ) : null}
          </dl>
        ) : (
          <p className="text-sm text-text m-3 mt-0">No user in session.</p>
        )}
      </div>
    </div>
  )
}
