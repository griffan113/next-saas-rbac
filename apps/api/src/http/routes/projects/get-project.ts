import { auth } from '@/http/middlewares/auth'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { prisma } from '@saas/database'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { StatusCodes } from 'http-status-codes'
import z from 'zod'
import { NotFoundError } from '../_errors/not-found-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export function getProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/:organizationSlug/projects/:projectSlug',
      {
        schema: {
          tags: ['Project'],
          summary: 'Get a project details',
          security: [{ bearerAuth: [] }],
          params: z.object({
            organizationSlug: z.string(),
            projectSlug: z.string(),
          }),
          response: {
            [StatusCodes.OK]: z.object({
              project: z
                .object({
                  id: z.string().uuid(),
                  name: z.string(),
                  slug: z.string(),
                  avatarUrl: z.string().url().nullable(),
                  ownerId: z.string().uuid(),
                  organizationId: z.string().uuid(),
                  description: z.string(),
                  owner: z.object({
                    name: z.string().nullable(),
                    id: z.string().uuid(),
                    avatarUrl: z.string().url().nullable(),
                  }),
                })
                .nullable(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { projectSlug, organizationSlug } = request.params

        const userId = await request.getCurrentUserId()

        const { organization, membership } =
          await request.getUserMembership(organizationSlug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('get', 'Project'))
          throw new UnauthorizedError(
            'Você não tem permissão para ver esse projeto'
          )

        const project = await prisma.project.findUnique({
          where: {
            slug: projectSlug,
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
            owner: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        })

        if (!project) {
          throw new NotFoundError('Projeto não encontrado')
        }

        return reply.status(StatusCodes.CREATED).send({
          project,
        })
      }
    )
}
