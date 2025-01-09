import * as z from "zod"
import { CompleteOrganization, relatedOrganizationModelSchema, CompleteUser, relatedUserModelSchema } from "./index"

export const projectModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  slug: z.string(),
  avatarUrl: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  organizationId: z.string(),
  ownerId: z.string(),
})

export interface CompleteProject extends z.infer<typeof projectModelSchema> {
  organization: CompleteOrganization
  owner: CompleteUser
}

/**
 * relatedProjectModelSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedProjectModelSchema: z.ZodSchema<CompleteProject> = z.lazy(() => projectModelSchema.extend({
  organization: relatedOrganizationModelSchema,
  owner: relatedUserModelSchema,
}))
