import { z } from 'zod'
import {
  authSessionResponseSchema,
  safeParseAuthSessionResponse,
  type AuthSessionResponse,
} from './login'

/** Body sent to `POST /auth/register` */
export const registerRequestSchema = z.object({
  email: z.string().trim().min(1, 'E-Mail ist erforderlich').email('Ungültige E-Mail'),
  password: z
    .string()
    .min(6, 'Das Passwort muss mindestens 6 Zeichen lang sein'),
  userName: z
    .preprocess(
      (v) => (v === '' || v === undefined || v === null ? undefined : v),
      z.string().trim().max(128, 'Benutzername ist zu lang').optional(),
    ),
})

export type RegisterRequest = z.infer<typeof registerRequestSchema>

/** Full signup form including password confirmation */
export const registerFormSchema = registerRequestSchema
  .extend({
    confirmPassword: z.string().min(1, 'Bestätigen Sie Ihr Passwort'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwörter stimmen nicht überein',
    path: ['confirmPassword'],
  })

export type RegisterFormValues = z.infer<typeof registerFormSchema>

/** Same JSON shape as login — no token fields (cookie-only session). */
export const registerResponseSchema = authSessionResponseSchema

export type RegisterResponse = AuthSessionResponse

export function safeParseRegisterResponse(
  data: unknown,
): z.SafeParseReturnType<unknown, RegisterResponse> {
  return safeParseAuthSessionResponse(data)
}
