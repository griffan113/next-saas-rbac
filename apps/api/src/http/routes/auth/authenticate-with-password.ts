import { prisma } from '@saas/database'
import { compare } from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { StatusCodes } from 'http-status-codes'
import { z } from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'

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

      if (!userFromEmail) throw new BadRequestError('Credenciais inválidas.')

      if (userFromEmail.passwordHash === null)
        throw new BadRequestError(
          'Usuário não possui uma senha. Use o login social.'
        )

      const isPasswordValid = await compare(
        password,
        userFromEmail.passwordHash
      )

      if (!isPasswordValid) throw new BadRequestError('Credenciais inválidas.')

      const token = await reply.jwtSign(
        { sub: userFromEmail.id },
        { sign: { expiresIn: '7d' } }
      )

      return reply.status(StatusCodes.CREATED).send({ token })
    }
  )
}
