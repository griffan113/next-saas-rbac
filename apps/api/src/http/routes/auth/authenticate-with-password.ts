import { prisma } from '@saas/database'
import { compare, hash } from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { StatusCodes } from 'http-status-codes'
import { z } from 'zod'

export async function authenticateWithPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sessions/password',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Authenticate with e-mail and password',
        response: {
          [StatusCodes.CREATED]: z.object({
            token: z.string(),
          }),
          [StatusCodes.BAD_REQUEST]: z.object({
            statusCode: z.number(),
            message: z.string(),
          }),
        },
        body: z.object({
          email: z.string().email(),
          password: z.string().min(6),
        }),
      },
    },
    async (request, reply) => {
      const { email, password } = request.body

      const userFromEmail = await prisma.user.findUnique({
        where: { email },
      })

      if (!userFromEmail)
        return reply.status(StatusCodes.BAD_REQUEST).send({
          statusCode: StatusCodes.BAD_REQUEST,
          message: 'Credenciais inválidas.',
        })

      if (userFromEmail.passwordHash === null)
        return reply.status(StatusCodes.BAD_REQUEST).send({
          statusCode: StatusCodes.BAD_REQUEST,
          message: 'Usuário não possui uma senha. Use o login social.',
        })

      const isPasswordValid = await compare(
        password,
        userFromEmail.passwordHash
      )

      if (!isPasswordValid)
        return reply.status(StatusCodes.BAD_REQUEST).send({
          statusCode: StatusCodes.BAD_REQUEST,
          message: 'Credenciais inválidas.',
        })

      const token = await reply.jwtSign(
        { sub: userFromEmail.id },
        { sign: { expiresIn: '7d' } }
      )

      return reply.status(StatusCodes.CREATED).send({ token })
    }
  )
}
