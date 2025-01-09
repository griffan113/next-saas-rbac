import { FastifyInstance } from 'fastify'
import { createOrganization } from './create-organization'
import { getMembership } from './get-membership'
import { getOrganization } from './get-organization'
import { getOrganizations } from './get-organizations'
import { shutdownOrganization } from './shutdown-organization'
import { updateOrganization } from './update-organization'

export function organizationsRoutes(app: FastifyInstance) {
  app.register(createOrganization)
  app.register(getMembership)
  app.register(getOrganization)
  app.register(getOrganizations)
  app.register(updateOrganization)
  app.register(shutdownOrganization)
}
