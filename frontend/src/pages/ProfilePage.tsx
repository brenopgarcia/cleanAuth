import { useAuthStore } from '../store/authStore'

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="max-w-[640px]">
      <h1 className="text-[28px] -tracking-[0.03em] m-0 mb-3 text-left">Profil</h1>
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
      </div>
    </div>
  )
}
