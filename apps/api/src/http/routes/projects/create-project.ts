import { auth } from '@/http/middlewares/auth'
import { generateSlug } from '@/utils/generate-slug'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { prisma } from '@saas/database'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { StatusCodes } from 'http-status-codes'
import z from 'zod'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export function createProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/:slug/projects',
      {
        schema: {
          tags: ['Project'],
          summary: 'Create a new project',
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string(),
            description: z.string(),
          }),
          params: z.object({
            slug: z.string(),
          }),
          response: {
            [StatusCodes.CREATED]: z.object({
              projectId: z.string().uuid(),
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

        if (cannot('create', 'Project'))
          throw new UnauthorizedError(
            'Você não tem permissão para criar projetos'
          )

        const { description, name } = request.body

        const project = await prisma.project.create({
          data: {
            name,
            description,
            slug: generateSlug(name),
            ownerId: userId,
            organizationId: organization.id,
          },
        })

        return reply.status(StatusCodes.CREATED).send({
          projectId: project.id,
        })
      }
    )
}
