import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAuthStore } from '../store/authStore'
import { useAccess } from './useAccess'

describe('useAccess', () => {
  it('treats admin as having tenant read/write', () => {
    useAuthStore.setState({
      user: { id: 'a', email: 'admin@example.com', role: 'admin', perms: [] },
    })

    const { result } = renderHook(() => useAccess())
    expect(result.current.isAdmin).toBe(true)
    expect(result.current.canTenantRead).toBe(true)
    expect(result.current.canTenantWrite).toBe(true)
  })

  it('uses perms for tenant_user', () => {
    useAuthStore.setState({
      user: { id: 'u', email: 'u@example.com', role: 'tenant_user', perms: ['tenant:read'] },
    })

    const { result } = renderHook(() => useAccess())
    expect(result.current.isAdmin).toBe(false)
    expect(result.current.canTenantRead).toBe(true)
    expect(result.current.canTenantWrite).toBe(false)
  })
})

