import type {
    NextFunction,
    Request,
    Response
} from 'express';

import ApiError from '../utils/ApiError';

const errorHandler = (
    err: unknown,
    _: Request,
    res: Response,
    __: NextFunction
) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            statusCode: err.statusCode,
            message: err.message,
            code: err.code,
            errorCode: err.code,
            errors: err.errors,
            stack:
                process.env.NODE_ENV ===
                'development'
                    ? err.stack
                    : undefined
        });
    }

    return res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'Internal Server Error',
        code: 'INTERNAL_SERVER_ERROR',
        errors: [],
        stack:
            process.env.NODE_ENV ===
            'development'
                ? err
                : undefined
    });
};

export default errorHandler;