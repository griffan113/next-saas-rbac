import * as z from "zod"
import { CompleteUser, relatedUserModelSchema, CompleteInvite, relatedInviteModelSchema, CompleteMember, relatedMemberModelSchema, CompleteProject, relatedProjectModelSchema } from "./index"

export const organizationModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  domain: z.string().nullish(),
  shouldAttachUsersByDomain: z.boolean(),
  avatarUrl: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  ownerId: z.string(),
})

export interface CompleteOrganization extends z.infer<typeof organizationModelSchema> {
  owner: CompleteUser
  invites: CompleteInvite[]
  members: CompleteMember[]
  projects: CompleteProject[]
}

/**
 * relatedOrganizationModelSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedOrganizationModelSchema: z.ZodSchema<CompleteOrganization> = z.lazy(() => organizationModelSchema.extend({
  owner: relatedUserModelSchema,
  invites: relatedInviteModelSchema.array(),
  members: relatedMemberModelSchema.array(),
  projects: relatedProjectModelSchema.array(),
}))
