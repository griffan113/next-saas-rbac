import * as z from "zod"
import { Role } from "@prisma/client"
import { CompleteOrganization, relatedOrganizationModelSchema, CompleteUser, relatedUserModelSchema } from "./index"

export const memberModelSchema = z.object({
  id: z.string(),
  role: z.nativeEnum(Role),
  organizationId: z.string(),
  userId: z.string(),
})

export interface CompleteMember extends z.infer<typeof memberModelSchema> {
  organization: CompleteOrganization
  user: CompleteUser
}

/**
 * relatedMemberModelSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedMemberModelSchema: z.ZodSchema<CompleteMember> = z.lazy(() => memberModelSchema.extend({
  organization: relatedOrganizationModelSchema,
  user: relatedUserModelSchema,
}))
