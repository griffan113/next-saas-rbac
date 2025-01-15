import { auth } from '@/http/middlewares/auth'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { projectSchema } from '@saas/auth'
import { prisma } from '@saas/database'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { StatusCodes } from 'http-status-codes'
import z from 'zod'
import { NotFoundError } from '../_errors/not-found-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export function updateProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/:slug/projects/:projectId',
      {
        schema: {
          tags: ['Project'],
          summary: 'Update an project',
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string().optional(),
            description: z.string().optional(),
          }),
          params: z.object({
            slug: z.string(),
            projectId: z.string().uuid(),
          }),
          response: {
            [StatusCodes.NO_CONTENT]: z.null(),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const { slug, projectId } = request.params

        const { membership, organization } =
          await request.getUserMembership(slug)

        const project = await prisma.project.findUnique({
          where: { id: projectId, organizationId: organization.id },
        })

        if (!project) throw new NotFoundError('Projeto não encontrado')

        const authProject = projectSchema.parse(project)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('update', authProject))
          throw new UnauthorizedError(
            'Você não tem as permissões para atualizar esse projeto'
          )

        const { name, description } = request.body

        await prisma.project.update({
          where: { id: projectId },
          data: {
            name,
            description,
          },
        })

        return reply.status(StatusCodes.NO_CONTENT).send()
      }
    )
}
