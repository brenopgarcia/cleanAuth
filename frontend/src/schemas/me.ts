import { z } from 'zod'

export const meResponseSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
  role: z.string().min(1),
  perms: z.array(z.string()).default([]),
})

export type MeResponse = z.infer<typeof meResponseSchema>

export function safeParseMeResponse(
  data: unknown,
): z.SafeParseReturnType<unknown, MeResponse> {
  return meResponseSchema.safeParse(data)
}
