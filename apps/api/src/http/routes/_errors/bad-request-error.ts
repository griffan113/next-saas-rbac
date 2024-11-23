import { StatusCodes } from 'http-status-codes'
import { GenericError } from './generic-error'

export class BadRequestError extends GenericError {
  constructor(message: string) {
    super(message, StatusCodes.BAD_REQUEST)
  }
}
