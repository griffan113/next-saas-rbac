import { auth } from '@/http/middlewares/auth'
import { rolesSchema } from '@saas/auth'
import { Role } from '@saas/database'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { StatusCodes } from 'http-status-codes'
import z from 'zod'

export function getMembership(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/:slug/membership',
      {
        schema: {
          tags: ['Organization'],
          summary: "Get user's organization membership",
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            [StatusCodes.OK]: z.object({
              membership: z.object({
                id: z.string().uuid(),
                role: rolesSchema,
                organizationId: z.string().uuid(),
              }),
            }),
          },
        },
      },
      async (request) => {
        const { slug } = request.params
        const {
          membership: { role, id, organizationId },
        } = await request.getUserMembership(slug)

        return {
          membership: {
            id,
            role,
            organizationId,
          },
        }
      }
    )
}
