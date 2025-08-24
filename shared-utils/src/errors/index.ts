/**
 * A generic error that is generated during an API request.
 * Contains a status code number and an error message.
 */
export class RequestError extends Error {
    public readonly statusCode: number;

    constructor(message: string, statusCode: number) {
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
 * An error that is generated when receiving an API request with which the client is not authorized to perform.
 * Has an status code of 401 and contains an error message.
 */
export class UnauthorizedError extends RequestError {
    constructor(message: string) {
        super(message, 401);
        this.name = 'UnauthorizedError';

        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}