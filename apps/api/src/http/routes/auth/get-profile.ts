import { prisma } from '@saas/database'
import { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { StatusCodes } from 'http-status-codes'
import z from 'zod'

export async function getProfile(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/profile',
    {
      schema: {
        tags: ['Profile'],
        summary: 'Get authenticated user profile',
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
          [StatusCodes.BAD_REQUEST]: z.object({
            statusCode: z.number(),
            message: z.literal('Usuário não encontrado'),
          }),
        },
      },
    },
    async (request, reply) => {
      const { sub } = await request.jwtVerify<{ sub: string }>()

      const user = await prisma.user.findUnique({
        select: { id: true, name: true, email: true, avatarUrl: true },
        where: { id: sub },
      })

      if (!user)
        return reply.status(StatusCodes.BAD_REQUEST).send({
          statusCode: StatusCodes.BAD_REQUEST,
          message: 'Usuário não encontrado',
        })

      return reply.send({ user })
    }
  )
}
