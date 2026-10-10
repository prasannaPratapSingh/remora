import type { Request, Response, NextFunction } from 'express';

type AsyncHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<unknown>;

// Promise.resolve hata diya, aur seedhe fn().catch(next) ko return kar diya
const asyncHandler = (fn: AsyncHandler) => (
    req: Request,
    res: Response,
    next: NextFunction
) => fn(req, res, next).catch(next); 

export default asyncHandler;