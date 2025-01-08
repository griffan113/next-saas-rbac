import { auth } from '@/http/middlewares/auth'
import { prisma } from '@saas/database'
import { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { StatusCodes } from 'http-status-codes'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'

export async function getProfile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/profile',
      {
        schema: {
          tags: ['Profile'],
          summary: 'Get authenticated user profile',
          security: [{ bearerAuth: [] }],
          response: {
            [StatusCodes.OK]: z.object({
              user: z
                .object({
                  id: z.string().uuid(),
                  name: z.string().nullable(),
                  email: z.string().email(),
                  avatarUrl: z.string().url().nullable(),
                })
                .nullable(),
            }),
          },
        },
      },
      async (request, reply) => {
        const sub = await request.getCurrentUserId()

        const user = await prisma.user.findUnique({
          select: { id: true, name: true, email: true, avatarUrl: true },
          where: { id: sub },
        })

        if (!user) throw new BadRequestError('Usuário não encontrado')

        return reply.send({ user })
      }
    )
}
