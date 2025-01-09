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

export function transferOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      '/:slug/owner',
      {
        schema: {
          tags: ['Organization'],
          summary: 'Transfer an organization',
          security: [{ bearerAuth: [] }],
          body: z.object({
            transferToUserId: z.string().uuid(),
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

        const authOrganization = organizationSchema.parse(organization)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('update', authOrganization))
          throw new UnauthorizedError(
            'Você não tem as permissões para tranferir essa organização'
          )

        const { transferToUserId } = request.body

        const transferToMembership = await prisma.member.findFirst({
          where: {
            organization: {
              id: organization.id,
            },
            userId: transferToUserId,
          },
        })

        if (!transferToMembership)
          throw new BadRequestError(
            'O usuário de destino não é um membro desta organização'
          )

        await prisma.$transaction([
          prisma.member.update({
            where: {
              id: transferToMembership.id,
            },
            data: {
              role: 'ADMIN',
            },
          }),

          prisma.organization.update({
            where: { id: organization.id },
            data: { ownerId: transferToUserId },
          }),
        ])

        return reply.status(StatusCodes.NO_CONTENT).send()
      }
    )
}
