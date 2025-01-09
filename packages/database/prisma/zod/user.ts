import * as z from "zod"
import { CompleteToken, relatedTokenModelSchema, CompleteAccount, relatedAccountModelSchema, CompleteInvite, relatedInviteModelSchema, CompleteMember, relatedMemberModelSchema, CompleteOrganization, relatedOrganizationModelSchema, CompleteProject, relatedProjectModelSchema } from "./index"

export const userModelSchema = z.object({
  id: z.string(),
  name: z.string().nullish(),
  email: z.string(),
  passwordHash: z.string().nullish(),
  avatarUrl: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteUser extends z.infer<typeof userModelSchema> {
  tokens: CompleteToken[]
  accounts: CompleteAccount[]
  invites: CompleteInvite[]
  memberships: CompleteMember[]
  ownsOrganizations: CompleteOrganization[]
  ownsProjects: CompleteProject[]
}

/**
 * relatedUserModelSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedUserModelSchema: z.ZodSchema<CompleteUser> = z.lazy(() => userModelSchema.extend({
  tokens: relatedTokenModelSchema.array(),
  accounts: relatedAccountModelSchema.array(),
  invites: relatedInviteModelSchema.array(),
  memberships: relatedMemberModelSchema.array(),
  ownsOrganizations: relatedOrganizationModelSchema.array(),
  ownsProjects: relatedProjectModelSchema.array(),
}))
