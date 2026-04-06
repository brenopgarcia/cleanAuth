import { z } from 'zod'
import {
  authSessionResponseSchema,
  safeParseAuthSessionResponse,
  type AuthSessionResponse,
} from './login'

/** Body sent to `POST /auth/register` */
export const registerRequestSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Invalid email'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
  userName: z
    .preprocess(
      (v) => (v === '' || v === undefined || v === null ? undefined : v),
      z.string().trim().max(128, 'Username is too long').optional(),
    ),
})

export type RegisterRequest = z.infer<typeof registerRequestSchema>

/** Full signup form including password confirmation */
export const registerFormSchema = registerRequestSchema
  .extend({
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
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
