import { StatusCodes } from 'http-status-codes'
import { GenericError } from './generic-error'

export class UnauthorizedError extends GenericError {
  constructor(message?: string) {
    super(message ?? 'Unauthorized.', StatusCodes.UNAUTHORIZED)
  }
}
