import { auth } from '@/http/middlewares/auth'
import { organizationModelSchema } from '@saas/database'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { StatusCodes } from 'http-status-codes'
import z from 'zod'

export function getOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/:slug',
      {
        schema: {
          tags: ['Organization'],
          summary: 'Retrieve the details of a organization',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            [StatusCodes.OK]: z.object({
              organization: organizationModelSchema,
            }),
          },
        },
      },
      async (request) => {
        const { slug } = request.params
        const { organization } = await request.getUserMembership(slug)

        return {
          organization,
        }
      }
    )
}
