import { FastifyInstance } from 'fastify'
import { authenticateWithPassword } from './authenticate-with-password'
import { createAccount } from './create-account'
import { getProfile } from './get-profile'
import { requestPasswordRecover } from './request-password-recover'

export async function authRoutes(app: FastifyInstance) {
  app.register(createAccount, { prefix: '/users' })
  app.register(authenticateWithPassword)
  app.register(getProfile)
  app.register(requestPasswordRecover)
}
