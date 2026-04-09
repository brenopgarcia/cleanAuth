import { z } from 'zod'

export const loginRequestSchema = z.object({
  email: z.string().trim().min(1, 'E-Mail ist erforderlich').email('Ungültige E-Mail'),
  password: z.string().min(1, 'Passwort ist erforderlich'),
})

export type LoginRequest = z.infer<typeof loginRequestSchema>

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().optional(),
  role: z.string().optional(),
  perms: z.array(z.string()).optional(),
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
