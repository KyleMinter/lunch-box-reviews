/**
 * A generic error that is generated during an API request.
 * Contains a status code number and an error message.
 */
export class RequestError extends Error {
  public readonly statusCode: number;

  constructor(message: string = 'An error has occured', statusCode: number) {
    super(message);
    this.name = 'RequestError';
    this.statusCode = statusCode;

    Object.setPrototypeOf(this, RequestError.prototype);
  }
}

/**
 * An error that is generated when receiving a bad or malformed API request.
 * Has an status code of 400 and contains an error message.
 */
export class BadRequestError extends RequestError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'BadRequestError';

    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

/**
 * An error that is generated when receiving an API request with no provided id.
 * Has an status code of 400 and contains an error message.
 */
export class NoIdProvidedError extends BadRequestError {
  constructor(message: string = 'Resource id not provided in path parameters') {
    super(message);
    this.name = 'NoIdProvidedError';

    Object.setPrototypeOf(this, NoIdProvidedError.prototype);
  }
}

/**
 * An error that is generated when receiving an API request with no provided body.
 * Has an status code of 400 and contains an error message.
 */
export class NoBodyProvidedError extends BadRequestError {
  constructor(message: string = 'Resource not provided in request body') {
    super(message);
    this.name = 'NoBodyProvidedError';

    Object.setPrototypeOf(this, NoBodyProvidedError.prototype);
  }
}

/**
 * An error that is generated when receiving an API request with which the client is not authorized to perform.
 * Has an status code of 401 and contains an error message.
 */
export class UnauthorizedError extends RequestError {
  constructor(message: string = 'User is not authorized for this action') {
    super(message, 401);
    this.name = 'UnauthorizedError';

    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * An error that is generated when a target resource does not exist.
 * Has a status code of 404 and contains an error message.
 */
export class NotFoundError extends RequestError {
  constructor(message: string = 'Resource could not be found') {
    super(message, 404);
    this.name = 'NotFoundError';

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * An error that is generated when receiving an API request with an unsupported method type.
 * Has a status code of 405 and contains an error message.
 */
export class MethodNotAllowedError extends RequestError {
  constructor(message: string = 'Request method not allowed on this resource') {
    super(message, 405);
    this.name = 'MethodNotAllowedError';

    Object.setPrototypeOf(this, MethodNotAllowedError.prototype);
  }
}