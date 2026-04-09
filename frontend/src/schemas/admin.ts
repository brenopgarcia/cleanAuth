import { z } from 'zod'

export const adminTenantSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  displayName: z.string().min(1),
  schemaName: z.string().min(1),
  isActive: z.boolean(),
  expiresAt: z.string().min(1),
})

export const adminTenantListSchema = z.array(adminTenantSchema)

export const adminTenantUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  userName: z.string().min(1),
})

export const adminTenantUserListSchema = z.array(adminTenantUserSchema)

export const resetPasswordResponseSchema = z.object({
  userId: z.string().min(1),
  resetToken: z.string().min(1),
  resetUrl: z.string().url(),
  expiresAt: z.string().min(1),
})

export type AdminTenant = z.infer<typeof adminTenantSchema>
export type AdminTenantUser = z.infer<typeof adminTenantUserSchema>
export type ResetPasswordResponse = z.infer<typeof resetPasswordResponseSchema>

