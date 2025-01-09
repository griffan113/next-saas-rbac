import { auth } from '@/http/middlewares/auth'
import { rolesSchema } from '@saas/auth'
import { prisma } from '@saas/database'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { StatusCodes } from 'http-status-codes'
import z from 'zod'

export function getOrganizations(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/',
      {
        schema: {
          tags: ['Organization'],
          summary: "Get user's organizations",
          security: [{ bearerAuth: [] }],
          response: {
            [StatusCodes.OK]: z.object({
              organizations: z.array(
                z.object({
                  id: z.string().uuid(),
                  name: z.string(),
                  slug: z.string(),
                  avatarUrl: z.string().url().nullable(),
                  role: rolesSchema,
                })
              ),
            }),
          },
        },
      },
      async (request) => {
        const userId = await request.getCurrentUserId()

        const organizations = await prisma.organization.findMany({
          select: {
            id: true,
            name: true,
            slug: true,
            avatarUrl: true,
            members: { select: { role: true }, where: { userId } },
          },
          where: { members: { some: { userId } } },
        })

        const organizationsWithUserRole = organizations.map(
          ({ members, ...org }) => {
            return {
              ...org,
              role: members[0].role,
            }
          }
        )

        return { organizations: organizationsWithUserRole }
      }
    )
}
