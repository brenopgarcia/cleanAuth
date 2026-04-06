import { z } from 'zod'

export const loginRequestSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginRequest = z.infer<typeof loginRequestSchema>

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().optional(),
})

export type AuthUser = z.infer<typeof authUserSchema>

/** JSON body after login/register — JWT is only in an HttpOnly cookie. */
export const authSessionResponseSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
  expiresIn: z.number().int().positive().optional(),
})

export type AuthSessionResponse = z.infer<typeof authSessionResponseSchema>

export function safeParseAuthSessionResponse(
  data: unknown,
): z.SafeParseReturnType<unknown, AuthSessionResponse> {
  return authSessionResponseSchema.safeParse(data)
}

export function authUserFromSession(data: AuthSessionResponse): AuthUser {
  return {
    id: data.userId,
    email: data.email,
  }
}
