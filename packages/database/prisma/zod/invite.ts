import * as z from "zod"
import { Role } from "@prisma/client"
import { CompleteUser, relatedUserModelSchema, CompleteOrganization, relatedOrganizationModelSchema } from "./index"

export const inviteModelSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.nativeEnum(Role),
  createdAt: z.date(),
  authorId: z.string().nullish(),
  organizationId: z.string(),
})

export interface CompleteInvite extends z.infer<typeof inviteModelSchema> {
  author?: CompleteUser | null
  organization: CompleteOrganization
}

/**
 * relatedInviteModelSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedInviteModelSchema: z.ZodSchema<CompleteInvite> = z.lazy(() => inviteModelSchema.extend({
  author: relatedUserModelSchema.nullish(),
  organization: relatedOrganizationModelSchema,
}))
