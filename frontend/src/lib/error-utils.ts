import axios from 'axios'
import { ZodError } from 'zod'

function getMessageFromApiPayload(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return null
  }

  const maybeMessage = (data as { message?: unknown }).message
  if (typeof maybeMessage === 'string' && maybeMessage.trim().length > 0) {
    return maybeMessage
  }

  for (const value of Object.values(data as Record<string, unknown>)) {
    if (Array.isArray(value)) {
      const first = value.find((item) => typeof item === 'string' && item.trim().length > 0)
      if (typeof first === 'string') {
        return first
      }
    }
  }

  return null
}

export function getErrorMessage(err: unknown, fallback = 'Es ist ein Fehler aufgetreten.'): string {
  if (err instanceof ZodError) {
    const flat = err.flatten()
    const firstField = Object.values(flat.fieldErrors).flat()[0]
    return firstField || flat.formErrors[0] || 'Validierung fehlgeschlagen.'
  }

  if (axios.isAxiosError(err)) {
    const status = err.response?.status
    if (status === 400) {
      const details = getMessageFromApiPayload(err.response?.data)
      if (details) {
        return details
      }
      return 'Ungueltige Anfrage.'
    }
    if (status === 401) {
      return 'Sitzung abgelaufen. Bitte erneut anmelden.'
    }
    if (status === 403) {
      return 'Keine Berechtigung fuer diese Aktion.'
    }
    if (status === 404) {
      return 'Ressource wurde nicht gefunden.'
    }
    if (status === 409) {
      return 'Konflikt: Die Aktion konnte nicht ausgefuehrt werden.'
    }
    if (status === 429) {
      return 'Zu viele Anfragen. Bitte spaeter erneut versuchen.'
    }
    if ((status ?? 0) >= 500) {
      return 'Serverfehler. Bitte spaeter erneut versuchen.'
    }

    return fallback
  }

  if (err instanceof Error) {
    return err.message
  }

  return fallback
}
