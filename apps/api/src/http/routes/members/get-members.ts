import { auth } from '@/http/middlewares/auth'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { rolesSchema } from '@saas/auth'
import { prisma } from '@saas/database'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { StatusCodes } from 'http-status-codes'
import z from 'zod'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export function getMembers(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/:slug/members',
      {
        schema: {
          tags: ['Member'],
          summary: 'Get an organization members',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            [StatusCodes.OK]: z.object({
              members: z.array(
                z.object({
                  name: z.string().nullable(),
                  avatarUrl: z.string().nullable(),
                  email: z.string(),
                  userId: z.string(),
                  id: z.string(),
                  role: rolesSchema,
                })
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params

        const userId = await request.getCurrentUserId()

        const { organization, membership } =
          await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('get', 'User'))
          throw new UnauthorizedError(
            'Você não tem permissão para ver os membros dessa organização'
          )

        const members = await prisma.member.findMany({
          where: {
            organizationId: organization.id,
          },
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            role: 'asc',
          },
        })

        const membersWithRoles = members.map(
          ({ user: { id: userId, ...user }, ...member }) => ({
            ...member,
            userId,
            ...user,
          })
        )

        return reply.status(StatusCodes.CREATED).send({
          members: membersWithRoles,
        })
      }
    )
}
