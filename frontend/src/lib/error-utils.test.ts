import { describe, expect, it } from 'vitest'
import axios, { AxiosError } from 'axios'
import { getErrorMessage } from './error-utils'

describe('getErrorMessage', () => {
  it('maps HTTP status codes to safe user-facing messages', () => {
    const unauthorized = new AxiosError('401', 'ERR_BAD_REQUEST', undefined, undefined, {
      status: 401,
      statusText: 'Unauthorized',
      headers: {},
      config: {} as never,
      data: {},
    })

    expect(axios.isAxiosError(unauthorized)).toBe(true)
    expect(getErrorMessage(unauthorized)).toBe('Sitzung abgelaufen. Bitte erneut anmelden.')
  })

  it('returns fallback for unknown axios error status', () => {
    const customFallback = 'Custom fallback'
    const unknown = new AxiosError('network')
    expect(getErrorMessage(unknown, customFallback)).toBe(customFallback)
  })

  it('prefers API message details for 400 responses', () => {
    const badRequest = new AxiosError('400', 'ERR_BAD_REQUEST', undefined, undefined, {
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as never,
      data: { message: 'Passwort muss mindestens 6 Zeichen haben.' },
    })

    expect(getErrorMessage(badRequest)).toBe('Passwort muss mindestens 6 Zeichen haben.')
  })

  it('reads first validation error from 400 dictionary payload', () => {
    const badRequest = new AxiosError('400', 'ERR_BAD_REQUEST', undefined, undefined, {
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as never,
      data: { Email: ['Invalid email address.'], Password: ['Password too short.'] },
    })

    expect(getErrorMessage(badRequest)).toBe('Invalid email address.')
  })
})

