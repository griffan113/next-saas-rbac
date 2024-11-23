import { FastifyInstance } from 'fastify'
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod'
import { StatusCodes } from 'http-status-codes'
import { BadRequestError } from './_errors/bad-request-error'
import { UnauthorizedError } from './_errors/unauthorized-error'

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(StatusCodes.BAD_REQUEST).send({
      statusCode: StatusCodes.BAD_REQUEST,
      message: 'Erro de validação',
      errors: error.validation,
    })
  }

  if (error instanceof BadRequestError) {
    return reply.status(StatusCodes.BAD_REQUEST).send({
      statusCode: StatusCodes.BAD_REQUEST,
      message: error.message,
    })
  }

  if (error instanceof UnauthorizedError) {
    return reply.status(StatusCodes.UNAUTHORIZED).send({
      statusCode: StatusCodes.UNAUTHORIZED,
      message: error.message,
    })
  }

  console.error(error)

  // TODO: Send error to observability platform

  return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message: 'Internal server error',
  })
}
