import { FastifyInstance } from 'fastify'
import { createOrganization } from './create-organization'
import { getMembership } from './get-membership'
import { getOrganization } from './get-organization'
import { getOrganizations } from './get-organizations'

export function organizationsRoutes(app: FastifyInstance) {
  app.register(createOrganization)
  app.register(getMembership)
  app.register(getOrganization)
  app.register(getOrganizations)
}
