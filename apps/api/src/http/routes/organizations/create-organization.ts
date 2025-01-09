import { auth } from '@/http/middlewares/auth'
import { generateSlug } from '@/utils/generate-slug'
import { prisma } from '@saas/database'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { StatusCodes } from 'http-status-codes'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'

export function createOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/',
      {
        schema: {
          tags: ['Organization'],
          summary: 'Create a new organization',
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string(),
            domain: z.string().nullish(),
            shouldAttachUsersByDomain: z.boolean().optional(),
          }),
          response: {
            [StatusCodes.CREATED]: z.object({
              organizationId: z.string().uuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const { name, domain, shouldAttachUsersByDomain } = request.body

        if (domain) {
          const findOrganizationByDomain = await prisma.organization.findUnique(
            { where: { domain } }
          )

          if (findOrganizationByDomain)
            throw new BadRequestError(
              'Outra organização está utilizando esse domínio.'
            )
        }

        const organization = await prisma.organization.create({
          data: {
            name,
            domain,
            shouldAttachUsersByDomain,
            slug: generateSlug(name),
            ownerId: userId,
            members: {
              create: { userId, role: 'ADMIN' },
            },
          },
        })

        return reply.status(201).send({
          organizationId: organization.id,
        })
      }
    )
}
