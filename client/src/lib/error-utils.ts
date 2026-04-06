import axios from 'axios'
import { ZodError } from 'zod'

export function getErrorMessage(err: unknown, fallback = 'Es ist ein Fehler aufgetreten.'): string {
  if (err instanceof ZodError) {
    const flat = err.flatten()
    const firstField = Object.values(flat.fieldErrors).flat()[0]
    return firstField || flat.formErrors[0] || 'Validierung fehlgeschlagen.'
  }

  if (axios.isAxiosError(err)) {
    const apiError = err.response?.data as { message?: string; error?: string } | undefined
    return apiError?.message || apiError?.error || err.message
  }

  if (err instanceof Error) {
    return err.message
  }

  return fallback
}
