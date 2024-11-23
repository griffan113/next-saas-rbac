import { prisma } from '@saas/database'
import { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { StatusCodes } from 'http-status-codes'
import z from 'zod'

export async function requestPasswordRecover(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/password/recover',
    {
      schema: {
        tags: ['Profile'],
        summary: 'Get authenticated user profile',
        body: z.object({
          email: z.string().email(),
        }),
        response: {
          [StatusCodes.CREATED]: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { email } = request.body

      const userFromEmail = await prisma.user.findUnique({
        where: { email },
      })

      // Por razões de segurança
      if (!userFromEmail) return reply.status(StatusCodes.CREATED).send()

      const { id: code } = await prisma.token.create({
        data: {
          type: 'PASSWORD_RECOVER',
          userId: userFromEmail.id,
        },
      })

      // TODO: Send e-mail with password recover link

      console.log('Recover password token: ', code)

      return reply.status(StatusCodes.CREATED).send()
    }
  )
}
