export abstract class GenericError {
  constructor(
    public message: string,
    public statusCode: number
  ) {
    this.message = message
    this.statusCode = statusCode
  }
}
