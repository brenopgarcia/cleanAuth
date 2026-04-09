import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  apiGetMock,
  apiPostMock,
  fetchCsrfTokenMock,
  safeParseMeResponseMock,
  safeParseAdminMeResponseMock,
} = vi.hoisted(() => ({
  apiGetMock: vi.fn(),
  apiPostMock: vi.fn(),
  fetchCsrfTokenMock: vi.fn(async () => {}),
  safeParseMeResponseMock: vi.fn(),
  safeParseAdminMeResponseMock: vi.fn(),
}))

vi.mock('../lib/api', () => ({
  default: {
    get: apiGetMock,
    post: apiPostMock,
  },
  fetchCsrfToken: fetchCsrfTokenMock,
}))

vi.mock('../schemas/me', () => ({
  safeParseMeResponse: safeParseMeResponseMock,
}))

vi.mock('../schemas/adminMe', () => ({
  safeParseAdminMeResponse: safeParseAdminMeResponseMock,
}))

import { useAuthStore } from './authStore'

describe('authStore bootstrap', () => {
  beforeEach(() => {
    apiGetMock.mockReset()
    apiPostMock.mockReset()
    fetchCsrfTokenMock.mockClear()
    safeParseMeResponseMock.mockReset()
    safeParseAdminMeResponseMock.mockReset()
    useAuthStore.setState({ user: null })
  })

  it('sets tenant user from /me when parse succeeds', async () => {
    apiGetMock.mockResolvedValueOnce({ data: { any: 'data' } })
    safeParseMeResponseMock.mockReturnValue({
      success: true,
      data: {
        userId: 'u1',
        email: 'tenant@example.com',
        role: 'tenant:user',
        perms: ['tenant:read'],
      },
    })

    await useAuthStore.getState().bootstrap()

    expect(fetchCsrfTokenMock).toHaveBeenCalledTimes(1)
    expect(useAuthStore.getState().user?.id).toBe('u1')
    expect(apiGetMock).toHaveBeenCalledWith('/me')
  })

  it('falls back to admin session when /me fails', async () => {
    apiGetMock
      .mockRejectedValueOnce(new Error('401'))
      .mockResolvedValueOnce({ data: { any: 'admin' } })
    safeParseAdminMeResponseMock.mockReturnValue({
      success: true,
      data: {
        adminId: 'a1',
        email: 'admin@example.com',
        role: 'admin',
      },
    })

    await useAuthStore.getState().bootstrap()

    expect(apiGetMock).toHaveBeenNthCalledWith(1, '/me')
    expect(apiGetMock).toHaveBeenNthCalledWith(2, '/admin/auth/me')
    expect(useAuthStore.getState().user).toEqual({
      id: 'a1',
      email: 'admin@example.com',
      role: 'admin',
      perms: [],
    })
  })
})

