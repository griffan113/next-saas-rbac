import { auth } from '@/http/middlewares/auth'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { organizationSchema } from '@saas/auth'
import { prisma } from '@saas/database'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { StatusCodes } from 'http-status-codes'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export function updateOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/:slug',
      {
        schema: {
          tags: ['Organization'],
          summary: 'Update an organization',
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string(),
            domain: z.string().nullish(),
            shouldAttachUsersByDomain: z.boolean().optional(),
          }),
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

        const { name, domain, shouldAttachUsersByDomain } = request.body

        const authOrganization = organizationSchema.parse(organization)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('update', authOrganization))
          throw new UnauthorizedError(
            'Você não tem as permissões para atualizar essa organização'
          )

        if (domain) {
          const findOrganizationByDomain = await prisma.organization.findFirst({
            where: { domain, slug: { not: slug } },
          })

          if (findOrganizationByDomain)
            throw new BadRequestError(
              'Outra organização está utilizando esse domínio.'
            )
        }

        await prisma.organization.update({
          where: { id: organization.id },
          data: { name, domain, shouldAttachUsersByDomain },
        })

        return reply.status(StatusCodes.NO_CONTENT).send()
      }
    )
}
