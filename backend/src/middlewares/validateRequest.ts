import type { Request, Response, NextFunction } from "express";

import type { ZodSchema } from "zod";

import { ZodError } from "zod";
import ApiError from "../utils/ApiError";


export const validateRequest = (schema: ZodSchema) => async (req: Request, _: Response, next: NextFunction) => {
    try {
        await schema.parseAsync({
            body: req.body,
            params: req.params,
            query: req.query
        })

        next()
    }
    catch (error) {
        if (error instanceof ZodError) {
            return next(
                new ApiError(400, "Validation Failed", error.issues, "")
            )
        }
        return next(error)
    }
}