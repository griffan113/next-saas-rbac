import * as z from "zod"
import { AccountProvider } from "@prisma/client"
import { CompleteUser, relatedUserModelSchema } from "./index"

export const accountModelSchema = z.object({
  id: z.string(),
  provider: z.nativeEnum(AccountProvider),
  providerAccountId: z.string(),
  createdAt: z.date(),
  userId: z.string(),
})

export interface CompleteAccount extends z.infer<typeof accountModelSchema> {
  user: CompleteUser
}

/**
 * relatedAccountModelSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedAccountModelSchema: z.ZodSchema<CompleteAccount> = z.lazy(() => accountModelSchema.extend({
  user: relatedUserModelSchema,
}))
