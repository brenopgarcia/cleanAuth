import { type FormEvent } from 'react'
import { useAuthStore } from '../store/authStore'
import { EmailInput } from '../components/EmailInput'
import { PasswordInput } from '../components/PasswordInput'
import { useAdminManagement } from '../hooks/useAdminManagement'

export function AdminPage() {
  const logout = useAuthStore((s) => s.logout)
  const admin = useAdminManagement()

  const inputClass =
    'font-inherit p-2.5 px-3 rounded-lg border border-border bg-bg text-text-h transition-[border-color,box-shadow] duration-200 focus:outline-none focus:border-accent-border focus:shadow-[0_0_0_3px_var(--accent-bg)] disabled:opacity-65 disabled:cursor-not-allowed'
  const buttonClass =
    'font-inherit font-medium p-2.5 px-3 rounded-lg border-2 cursor-pointer text-text-h bg-accent-bg border-accent-border transition-[box-shadow,transform] duration-200 hover:enabled:shadow-custom active:enabled:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed'
  const dangerButtonClass =
    'font-inherit font-medium p-2 px-2.5 rounded-lg border cursor-pointer text-text-h bg-error-bg border-error-border transition-[box-shadow,transform] duration-200 hover:enabled:shadow-custom active:enabled:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed'

  async function handleCreateTenant(e: FormEvent) {
    e.preventDefault()
    await admin.createTenant()
  }

  async function handleCreateUser(e: FormEvent) {
    e.preventDefault()
    await admin.createUser()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-bg shadow-custom p-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="m-0 text-sm font-semibold text-text-h">Admin</h3>
          <p className="m-0 mt-1 text-xs text-text">Tenant Provisioning & Benutzerverwaltung</p>
        </div>
        <button
          type="button"
          className={buttonClass}
          onClick={() => void logout()}
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-bg shadow-custom p-4">
          <h3 className="m-0 mb-3 text-sm font-semibold text-text-h">Tenants</h3>

          <form onSubmit={handleCreateTenant} className="flex flex-col gap-2 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                className={inputClass}
                placeholder="Slug (z.B. tenant-a)"
                value={admin.createTenantSlug}
                onChange={(e) => admin.setCreateTenantSlug(e.target.value)}
                disabled={admin.isCreatingTenant}
              />
              <input
                className={inputClass}
                placeholder="Display Name"
                value={admin.createTenantName}
                onChange={(e) => admin.setCreateTenantName(e.target.value)}
                disabled={admin.isCreatingTenant}
              />
              <input
                className={inputClass}
                type="datetime-local"
                value={admin.createTenantExpiresAt}
                onChange={(e) => admin.setCreateTenantExpiresAt(e.target.value)}
                disabled={admin.isCreatingTenant}
              />
            </div>
            {admin.createTenantError ? (
              <p className="m-0 text-sm text-error-text">{admin.createTenantError}</p>
            ) : null}
            <div className="flex items-center gap-2">
              <button type="submit" className={buttonClass} disabled={admin.isCreatingTenant}>
                {admin.isCreatingTenant ? 'Erstelle…' : 'Tenant erstellen'}
              </button>
              <button type="button" className={buttonClass} onClick={() => void admin.loadTenants()}>
                Aktualisieren
              </button>
            </div>
          </form>

          {admin.tenantsError && <p className="m-0 mb-2 text-sm text-error-text">{admin.tenantsError}</p>}
          {!admin.tenants ? (
            <p className="m-0 text-sm text-text">Lade…</p>
          ) : admin.tenants.length === 0 ? (
            <p className="m-0 text-sm text-text">Noch keine Tenants.</p>
          ) : (
            <>
              <div className="mb-3">
                <label className="text-xs text-text block mb-1">Ausgewählter Tenant</label>
                <select
                  className={inputClass}
                  value={admin.selectedTenantSlug}
                  onChange={(e) => admin.setSelectedTenantSlug(e.target.value)}
                >
                  {admin.tenants.map((t) => (
                    <option key={t.id} value={t.slug}>
                      {t.slug} — {t.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2">Slug</th>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Schema</th>
                      <th className="text-left p-2">Ablaufdatum</th>
                      <th className="text-left p-2">Aktiv</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admin.tenants.map((t) => (
                      <tr
                        key={t.id}
                        className={`border-b border-border/60 ${t.slug === admin.selectedTenantSlug ? 'bg-accent-bg/40' : ''}`}
                      >
                        <td className="p-2 font-medium">{t.slug}</td>
                        <td className="p-2">{t.displayName}</td>
                        <td className="p-2 font-mono text-xs">{t.schemaName}</td>
                        <td className="p-2">{new Date(t.expiresAt).toLocaleString('de-DE')}</td>
                        <td className="p-2">{t.isActive ? 'ja' : 'nein'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="rounded-xl border border-border bg-bg shadow-custom p-4">
          <h3 className="m-0 mb-1 text-sm font-semibold text-text-h">Tenant Benutzer</h3>
          <p className="m-0 mb-3 text-xs text-text">
            {admin.selectedTenant ? (
              <>
                Tenant: <span className="font-medium text-text-h">{admin.selectedTenant.displayName}</span>{' '}
                <span className="font-mono text-[11px] text-text">({admin.selectedTenant.slug})</span>
              </>
            ) : (
              'Bitte Tenant auswählen.'
            )}
          </p>

          <form onSubmit={handleCreateUser} className="flex flex-col gap-2 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <EmailInput
                className={inputClass}
                value={admin.newUserEmail}
                onChange={(e) => admin.setNewUserEmail(e.target.value)}
                disabled={admin.isCreatingUser}
                placeholder="E-Mail"
              />
              <input
                className={inputClass}
                value={admin.newUserName}
                onChange={(e) => admin.setNewUserName(e.target.value)}
                disabled={admin.isCreatingUser}
                placeholder="Benutzername"
              />
            </div>
            <PasswordInput
              className={inputClass}
              value={admin.newUserPassword}
              onChange={(e) => admin.setNewUserPassword(e.target.value)}
              disabled={admin.isCreatingUser}
              placeholder="Passwort (min. 8 Zeichen)"
            />
            {admin.createUserError ? (
              <p className="m-0 text-sm text-error-text">{admin.createUserError}</p>
            ) : null}
            <div className="flex items-center gap-2">
              <button type="submit" className={buttonClass} disabled={admin.isCreatingUser || !admin.selectedTenantSlug}>
                {admin.isCreatingUser ? 'Erstelle…' : 'Benutzer erstellen'}
              </button>
              <button
                type="button"
                className={buttonClass}
                onClick={() => (admin.selectedTenantSlug ? void admin.loadUsers() : undefined)}
                disabled={!admin.selectedTenantSlug}
              >
                Aktualisieren
              </button>
            </div>
          </form>

          {admin.resetPwdError ? <p className="m-0 mb-2 text-sm text-error-text">{admin.resetPwdError}</p> : null}
          {admin.lastTempPassword ? (
            <div className="m-0 mb-3 p-2.5 px-3 rounded-lg text-sm text-text-h bg-accent-bg/40 border border-accent-border">
              <p className="m-0 font-medium">Einmaliger Reset-Link (Token)</p>
              <p className="m-0 mt-1">
                {admin.lastTempPassword.email}:
              </p>
              <p className="m-0 mt-1 break-all">
                <a
                  className="text-accent underline"
                  href={admin.lastTempPassword.resetUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {admin.lastTempPassword.resetUrl}
                </a>
              </p>
              <p className="m-0 mt-1 text-xs text-text">
                Token: <span className="font-mono break-all">{admin.lastTempPassword.resetToken}</span>
              </p>
              <p className="m-0 mt-1 text-xs text-text">
                Gültig bis: {new Date(admin.lastTempPassword.expiresAt).toLocaleString('de-DE')}
              </p>
            </div>
          ) : null}

          {admin.usersError ? <p className="m-0 mb-2 text-sm text-error-text">{admin.usersError}</p> : null}
          {admin.isLoadingUsers ? (
            <p className="m-0 text-sm text-text">Lade…</p>
          ) : !admin.selectedTenantSlug ? (
            <p className="m-0 text-sm text-text">Bitte einen Tenant auswählen.</p>
          ) : !admin.users ? (
            <p className="m-0 text-sm text-text">Lade…</p>
          ) : admin.users.length === 0 ? (
            <p className="m-0 text-sm text-text">Keine Benutzer.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2">E-Mail</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {admin.users.map((u) => (
                    <tr key={u.id} className="border-b border-border/60">
                      <td className="p-2 font-medium">{u.email}</td>
                      <td className="p-2">{u.userName}</td>
                      <td className="p-2">
                        <button
                          type="button"
                          className={dangerButtonClass}
                          onClick={() => void admin.resetPassword(u)}
                          disabled={admin.resetPwdUserId === u.id}
                        >
                          {admin.resetPwdUserId === u.id ? 'Reset…' : 'Reset Password'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

