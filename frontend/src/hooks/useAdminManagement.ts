import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { getErrorMessage } from '../lib/error-utils'
import {
  adminTenantSchema,
  adminTenantListSchema,
  adminTenantUserListSchema,
  resetPasswordResponseSchema,
  type AdminTenant,
  type AdminTenantUser,
} from '../schemas/admin'

type LastTempPassword = {
  email: string
  resetToken: string
  resetUrl: string
  expiresAt: string
}

export function useAdminManagement() {
  const queryClient = useQueryClient()

  const [createTenantSlug, setCreateTenantSlug] = useState('')
  const [createTenantName, setCreateTenantName] = useState('')
  const [createTenantExpiresAt, setCreateTenantExpiresAt] = useState('')
  const [createTenantError, setCreateTenantError] = useState<string | null>(null)

  const [selectedTenantSlug, setSelectedTenantSlug] = useState<string>('')

  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserName, setNewUserName] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [createUserError, setCreateUserError] = useState<string | null>(null)

  const [resetPwdUserId, setResetPwdUserId] = useState<string | null>(null)
  const [resetPwdError, setResetPwdError] = useState<string | null>(null)
  const [lastTempPassword, setLastTempPassword] = useState<LastTempPassword | null>(null)

  const tenantsQuery = useQuery<AdminTenant[]>({
    queryKey: ['admin', 'tenants'],
    queryFn: async () => {
      const r = await api.get<unknown>('/admin/tenants')
      const parsed = adminTenantListSchema.safeParse(r.data)
      if (!parsed.success) {
        throw parsed.error
      }
      return parsed.data
    },
  })

  const tenants = tenantsQuery.data ?? null
  const tenantsError = tenantsQuery.error
    ? getErrorMessage(tenantsQuery.error, 'Konnte Tenants nicht laden.')
    : null

  const resolvedTenantSlug = selectedTenantSlug || tenants?.[0]?.slug || ''

  const selectedTenant = useMemo(
    () => (tenants ?? []).find((t) => t.slug === resolvedTenantSlug) ?? null,
    [tenants, resolvedTenantSlug],
  )

  const usersQuery = useQuery<AdminTenantUser[]>({
    queryKey: ['admin', 'tenant-users', resolvedTenantSlug],
    enabled: !!resolvedTenantSlug,
    queryFn: async () => {
      const r = await api.get<unknown>(`/admin/tenants/${resolvedTenantSlug}/users`)
      const parsed = adminTenantUserListSchema.safeParse(r.data)
      if (!parsed.success) {
        throw parsed.error
      }
      return parsed.data
    },
  })

  const users = usersQuery.data ?? null
  const usersError = usersQuery.error
    ? getErrorMessage(usersQuery.error, 'Konnte Benutzer nicht laden.')
    : null
  const isLoadingUsers = usersQuery.isLoading || usersQuery.isFetching

  async function createTenant() {
    setCreateTenantError(null)
    const slug = createTenantSlug.trim().toLowerCase()
    const displayName = createTenantName.trim()
    const expiresAtRaw = createTenantExpiresAt.trim()
    if (!slug) {
      setCreateTenantError('Slug ist erforderlich.')
      return
    }
    if (!displayName) {
      setCreateTenantError('Name ist erforderlich.')
      return
    }
    if (!expiresAtRaw) {
      setCreateTenantError('Ablaufdatum ist erforderlich.')
      return
    }
    const expiresAt = new Date(expiresAtRaw)
    if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
      setCreateTenantError('Ablaufdatum muss in der Zukunft liegen.')
      return
    }

    createTenantMutation.reset()
    try {
      const created = await createTenantMutation.mutateAsync({ slug, displayName, expiresAt: expiresAt.toISOString() })
      await queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] })
      setSelectedTenantSlug(created.slug)
      setCreateTenantSlug('')
      setCreateTenantName('')
      setCreateTenantExpiresAt('')
    } catch (error: unknown) {
      setCreateTenantError(getErrorMessage(error, 'Tenant konnte nicht erstellt werden.'))
    }
  }

  async function createUser() {
    setCreateUserError(null)
    if (!selectedTenantSlug) {
      setCreateUserError('Bitte zuerst einen Tenant auswählen.')
      return
    }
    const email = newUserEmail.trim().toLowerCase()
    const userName = newUserName.trim()
    const password = newUserPassword
    if (!email) {
      setCreateUserError('E-Mail ist erforderlich.')
      return
    }
    if (!userName) {
      setCreateUserError('Benutzername ist erforderlich.')
      return
    }
    if (password.length < 8) {
      setCreateUserError('Passwort muss mindestens 8 Zeichen haben.')
      return
    }

    createUserMutation.reset()
    try {
      await createUserMutation.mutateAsync({ tenantSlug: selectedTenantSlug, email, userName, password })
      await queryClient.invalidateQueries({ queryKey: ['admin', 'tenant-users', selectedTenantSlug] })
      setNewUserEmail('')
      setNewUserName('')
      setNewUserPassword('')
    } catch (error: unknown) {
      setCreateUserError(getErrorMessage(error, 'Benutzer konnte nicht erstellt werden.'))
    }
  }

  async function resetPassword(user: AdminTenantUser) {
    setResetPwdError(null)
    setLastTempPassword(null)
    if (!selectedTenantSlug) {
      setResetPwdError('Bitte zuerst einen Tenant auswählen.')
      return
    }
    const ok = window.confirm(`Passwort für "${user.email}" wirklich zurücksetzen?`)
    if (!ok) {
      return
    }

    resetPasswordMutation.reset()
    try {
      const parsed = await resetPasswordMutation.mutateAsync({
        tenantSlug: selectedTenantSlug,
        userId: user.id,
      })
      setLastTempPassword({
        email: user.email,
        resetToken: parsed.data.resetToken,
        resetUrl: parsed.data.resetUrl,
        expiresAt: parsed.data.expiresAt,
      })
    } catch (error: unknown) {
      setResetPwdError(getErrorMessage(error, 'Passwort konnte nicht zurückgesetzt werden.'))
    }
  }

  const createTenantMutation = useMutation({
    mutationFn: async ({
      slug,
      displayName,
      expiresAt,
    }: {
      slug: string
      displayName: string
      expiresAt: string
    }) => {
      const { data } = await api.post<unknown>('/admin/tenants', { slug, displayName, expiresAt })
      const parsed = adminTenantSchema.safeParse(data)
      if (!parsed.success) {
        throw parsed.error
      }
      return parsed.data
    },
  })

  const createUserMutation = useMutation({
    mutationFn: async ({
      tenantSlug,
      email,
      userName,
      password,
    }: {
      tenantSlug: string
      email: string
      userName: string
      password: string
    }) => {
      await api.post(`/admin/tenants/${tenantSlug}/users`, { email, userName, password })
    },
  })

  const resetPasswordMutation = useMutation({
    mutationFn: async ({
      tenantSlug,
      userId,
    }: {
      tenantSlug: string
      userId: string
    }) => {
      setResetPwdUserId(userId)
      const { data } = await api.post<unknown>(
        `/admin/tenants/${tenantSlug}/users/${userId}/reset-password`,
      )
      const parsed = resetPasswordResponseSchema.safeParse(data)
      if (!parsed.success) {
        throw parsed.error
      }
      return parsed
    },
    onSettled: () => {
      setResetPwdUserId(null)
    },
  })

  async function loadTenants() {
    await tenantsQuery.refetch()
  }

  async function loadUsers() {
    await usersQuery.refetch()
  }

  return {
    tenants,
    tenantsError,
    createTenantSlug,
    setCreateTenantSlug,
    createTenantName,
    setCreateTenantName,
    createTenantExpiresAt,
    setCreateTenantExpiresAt,
    createTenantError,
    isCreatingTenant: createTenantMutation.isPending,
    selectedTenantSlug: resolvedTenantSlug,
    setSelectedTenantSlug,
    selectedTenant,
    users,
    usersError,
    isLoadingUsers,
    newUserEmail,
    setNewUserEmail,
    newUserName,
    setNewUserName,
    newUserPassword,
    setNewUserPassword,
    createUserError,
    isCreatingUser: createUserMutation.isPending,
    resetPwdUserId,
    resetPwdError,
    lastTempPassword,
    loadTenants,
    loadUsers,
    createTenant,
    createUser,
    resetPassword,
  }
}

