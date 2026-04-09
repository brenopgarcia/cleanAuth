import { useMemo } from 'react'
import { useAuthStore } from '../store/authStore'

export type Permission = 'tenant:read' | 'tenant:write'

function hasPerm(perms: string[] | undefined, perm: Permission): boolean {
  return Array.isArray(perms) && perms.includes(perm)
}

export function useAccess() {
  const user = useAuthStore((s) => s.user)

  return useMemo(() => {
    const role = user?.role ?? 'tenant_user'
    const perms = user?.perms ?? []
    const isAdmin = role === 'admin'

    return {
      user,
      role,
      perms,
      isAdmin,
      canTenantRead: isAdmin || hasPerm(perms, 'tenant:read'),
      canTenantWrite: isAdmin || hasPerm(perms, 'tenant:write'),
    }
  }, [user])
}

