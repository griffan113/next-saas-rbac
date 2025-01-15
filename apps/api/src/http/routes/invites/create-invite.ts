import { auth } from '@/http/middlewares/auth'
import { generateSlug } from '@/utils/generate-slug'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { rolesSchema } from '@saas/auth'
import { prisma } from '@saas/database'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { StatusCodes } from 'http-status-codes'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export function createInvite(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/:slug/invites',
      {
        schema: {
          tags: ['Invite'],
          summary: 'Create a new invite',
          security: [{ bearerAuth: [] }],
          body: z.object({
            email: z.string().email(),
            role: rolesSchema,
          }),
          params: z.object({
            slug: z.string(),
          }),
          response: {
            [StatusCodes.CREATED]: z.object({
              inviteId: z.string().uuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params

        const userId = await request.getCurrentUserId()

        const { organization, membership } =
          await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('create', 'Invite'))
          throw new UnauthorizedError(
            'Você não tem permissão para criar convites'
          )

        const { email, role } = request.body

        const [, domain] = email

        if (
          organization.shouldAttachUsersByDomain &&
          organization.domain === domain
        )
          throw new BadRequestError(
            `Usuário com o domínio ${domain} serão adicionados automaticamente à organização`
          )

        const inviteWithSameEmail = await prisma.invite.findUnique({
          where: {
            email_organizationId: {
              email,
              organizationId: organization.id,
            },
          },
        })

        if (inviteWithSameEmail)
          throw new BadRequestError(
            `Um convite já foi enviado para o email ${email} na organização`
          )

        const existingMember = await prisma.user.findUnique({
          where: {
            email: email,
          },
        })

        if (existingMember) {
          throw new BadRequestError(
            `Já existe um membro com o email ${email} pertencente à organização`
          )
        }

        const invite = await prisma.invite.create({
          data: {
            email,
            role,
            authorId: userId,
            organizationId: organization.id,
          },
        })

        return reply.status(StatusCodes.CREATED).send({
          inviteId: invite.id,
        })
      }
    )
}
