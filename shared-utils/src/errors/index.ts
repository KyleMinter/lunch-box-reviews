export class RequestError extends Error {
    public readonly statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.name = 'RequestError';
        this.statusCode = statusCode;

        Object.setPrototypeOf(this, RequestError.prototype);
    }
}

export class BadRequestError extends RequestError {
    constructor(message: string) {
        super(message, 400);
        this.name = 'BadRequestError';

        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
}

export class UnauthorizedError extends RequestError {
    constructor(message: string) {
        super(message, 401);
        this.name = 'UnauthorizedError';

        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}