import { describe, expect, it } from 'vitest'
import { isAuthExemptUrl, isLikelyCsrfError, isUnsafeMethod } from './api'

describe('isAuthExemptUrl', () => {
  it('returns true for auth and antiforgery endpoints', () => {
    expect(isAuthExemptUrl('/auth/login')).toBe(true)
    expect(isAuthExemptUrl('/auth/register')).toBe(true)
    expect(isAuthExemptUrl('/auth/refresh')).toBe(true)
    expect(isAuthExemptUrl('/admin/auth/me')).toBe(true)
    expect(isAuthExemptUrl('/antiforgery/token')).toBe(true)
  })

  it('returns false for protected non-auth endpoints', () => {
    expect(isAuthExemptUrl('/me')).toBe(false)
    expect(isAuthExemptUrl('/admin/tenants')).toBe(false)
  })

  it('returns true for undefined url', () => {
    expect(isAuthExemptUrl(undefined)).toBe(true)
  })
})

describe('isUnsafeMethod', () => {
  it('returns true for non-safe HTTP methods', () => {
    expect(isUnsafeMethod('post')).toBe(true)
    expect(isUnsafeMethod('put')).toBe(true)
    expect(isUnsafeMethod('delete')).toBe(true)
  })

  it('returns false for safe methods', () => {
    expect(isUnsafeMethod('get')).toBe(false)
    expect(isUnsafeMethod('head')).toBe(false)
    expect(isUnsafeMethod('options')).toBe(false)
    expect(isUnsafeMethod(undefined)).toBe(false)
  })
})

describe('isLikelyCsrfError', () => {
  it('returns true when payload suggests csrf/antiforgery failure', () => {
    expect(isLikelyCsrfError({ message: 'CSRF token invalid' })).toBe(true)
    expect(isLikelyCsrfError({ error: 'Antiforgery validation failed' })).toBe(true)
  })

  it('returns false for unrelated payloads', () => {
    expect(isLikelyCsrfError({ message: 'Validation failed' })).toBe(false)
    expect(isLikelyCsrfError('plain string')).toBe(false)
    expect(isLikelyCsrfError(null)).toBe(false)
  })
})

