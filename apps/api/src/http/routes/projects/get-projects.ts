import { auth } from '@/http/middlewares/auth'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { prisma } from '@saas/database'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { StatusCodes } from 'http-status-codes'
import z from 'zod'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export function getProjects(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/:slug/projects',
      {
        schema: {
          tags: ['Project'],
          summary: 'Get a project details',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            [StatusCodes.OK]: z.object({
              projects: z.array(
                z.object({
                  id: z.string().uuid(),
                  name: z.string(),
                  slug: z.string(),
                  avatarUrl: z.string().url().nullable(),
                  ownerId: z.string().uuid(),
                  organizationId: z.string().uuid(),
                  description: z.string(),
                  createdAt: z.date(),
                  owner: z.object({
                    name: z.string().nullable(),
                    id: z.string().uuid(),
                    avatarUrl: z.string().url().nullable(),
                  }),
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

        if (cannot('get', 'Project'))
          throw new UnauthorizedError(
            'Você não tem permissão para ver os projetos dessa organização'
          )

        const projects = await prisma.project.findMany({
          where: {
            organizationId: organization.id,
          },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            ownerId: true,
            avatarUrl: true,
            organizationId: true,
            createdAt: true,
            owner: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        })

        return reply.status(StatusCodes.CREATED).send({
          projects,
        })
      }
    )
}
