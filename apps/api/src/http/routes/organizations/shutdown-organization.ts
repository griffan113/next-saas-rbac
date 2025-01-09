import { auth } from '@/http/middlewares/auth'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { organizationSchema } from '@saas/auth'
import { prisma } from '@saas/database'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { StatusCodes } from 'http-status-codes'
import z from 'zod'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export function shutdownOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/:slug',
      {
        schema: {
          tags: ['Organization'],
          summary: 'Shutdown an organization',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            [StatusCodes.NO_CONTENT]: z.null(),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const { slug } = request.params

        const { membership, organization } =
          await request.getUserMembership(slug)

        const authOrganization = organizationSchema.parse(organization)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('delete', authOrganization))
          throw new UnauthorizedError(
            'Você não tem as permissões para encerrar essa organização'
          )

        await prisma.organization.delete({
          where: { id: organization.id },
        })

        return reply.status(StatusCodes.NO_CONTENT).send()
      }
    )
}
