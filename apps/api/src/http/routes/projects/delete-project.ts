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

export function deleteProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/:slug/projects/:projectId',
      {
        schema: {
          tags: ['Project'],
          summary: 'Delete an project',
          security: [{ bearerAuth: [] }],
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

        if (cannot('delete', authProject))
          throw new UnauthorizedError(
            'Você não tem as permissões para remover esse projeto'
          )

        await prisma.project.delete({
          where: { id: projectId },
        })

        return reply.status(StatusCodes.NO_CONTENT).send()
      }
    )
}
