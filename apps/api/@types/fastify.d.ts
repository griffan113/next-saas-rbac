import { Member, Organization } from '@saas/database'
import 'fastify'

declare module 'fastify' {
  export interface FastifyRequest {
    getCurrentUserId(): Promise<string>
    getUserMembership(
      slug: string
    ): Promise<{ organization: Organization; membership: Member }>
  }
}
