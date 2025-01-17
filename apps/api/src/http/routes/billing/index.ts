import { FastifyInstance } from 'fastify'
import { getOrganizationBilling } from './get-organization-billing'

export function billingRoutes(app: FastifyInstance) {
  app.register(getOrganizationBilling)
}
