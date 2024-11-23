import { prisma } from '@saas/database'
import { hash } from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { StatusCodes } from 'http-status-codes'
import { z } from 'zod'

export async function createAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Create a new account',
        body: z.object({
          name: z.string(),
          email: z.string().email(),
          password: z.string().min(6),
        }),
      },
    },
    async (request, reply) => {
      const { email, name, password } = request.body

      const userWithSameEmail = await prisma.user.findUnique({
        where: { email },
      })

      if (userWithSameEmail)
        reply.status(StatusCodes.BAD_REQUEST).send({
          statusCode: StatusCodes.BAD_REQUEST,
          message: 'Este e-mail já está sendo utilizado.',
        })

      const [, domain] = email.split('@')

      const autoJoinOrganization = await prisma.organization.findFirst({
        where: {
          domain,
          shouldAttachUsersByDomain: true,
        },
      })

      // 6 - Força do hash
      const passwordHash = await hash(password, 6)

      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          memberships: autoJoinOrganization
            ? { create: { organizationId: autoJoinOrganization.id } }
            : undefined,
        },
      })

      return reply.status(StatusCodes.CREATED).send(user)
    }
  )
}
