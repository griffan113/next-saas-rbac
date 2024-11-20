import { FastifyInstance } from 'fastify'
import { createAccount } from './create-account'

export async function authRoutes(app: FastifyInstance) {
  app.register(createAccount)
}
