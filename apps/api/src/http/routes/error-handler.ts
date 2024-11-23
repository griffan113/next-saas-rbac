import { FastifyInstance } from 'fastify'
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod'
import { StatusCodes } from 'http-status-codes'
import { GenericError } from './_errors/generic-error'

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(StatusCodes.BAD_REQUEST).send({
      statusCode: StatusCodes.BAD_REQUEST,
      message: 'Erro de validação',
      errors: error.validation,
    })
  }

  if (error instanceof GenericError) {
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
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
