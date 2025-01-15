import { FastifyInstance } from 'fastify'
import { createInvite } from './create-invite'

export function invitesRoutes(app: FastifyInstance) {
  app.register(createInvite)
}
