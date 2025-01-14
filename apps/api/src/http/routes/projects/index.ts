import { FastifyInstance } from 'fastify'
import { createProject } from './create-project'
import { deleteProject } from './delete-project'

export function projectsRoutes(app: FastifyInstance) {
  app.register(createProject)
  app.register(deleteProject)
}
