class ApiError extends Error {
    statusCode: number;
    success: boolean;
    errors: unknown[];
    code: string | undefined;

    constructor(
        statusCode: number,
        message = 'Something went wrong 😑',
        errors: unknown[] = [],
        code?: string,
        stack?: string
    ) {
        super(message);

        this.statusCode = statusCode;
        this.success = false;
        this.errors = errors;
        this.code = code;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(
                this,
                this.constructor
            );
        }
    }
}

export default ApiError;