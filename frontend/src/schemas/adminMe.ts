import { z } from 'zod'

export const adminMeResponseSchema = z.object({
  adminId: z.string().min(1),
  email: z.string().email(),
  role: z.string().min(1),
})

export type AdminMeResponse = z.infer<typeof adminMeResponseSchema>

export function safeParseAdminMeResponse(
  data: unknown,
): z.SafeParseReturnType<unknown, AdminMeResponse> {
  return adminMeResponseSchema.safeParse(data)
}

