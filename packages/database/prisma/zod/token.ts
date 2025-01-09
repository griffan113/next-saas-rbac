import * as z from "zod"
import { TokenType } from "@prisma/client"
import { CompleteUser, relatedUserModelSchema } from "./index"

export const tokenModelSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(TokenType),
  createdAt: z.date(),
  userId: z.string(),
})

export interface CompleteToken extends z.infer<typeof tokenModelSchema> {
  user: CompleteUser
}

/**
 * relatedTokenModelSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedTokenModelSchema: z.ZodSchema<CompleteToken> = z.lazy(() => tokenModelSchema.extend({
  user: relatedUserModelSchema,
}))
