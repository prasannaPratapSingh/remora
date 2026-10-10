import { getAuth } from "@clerk/express"
import type { NextFunction, Request, Response } from "express"
import ApiError from "../utils/ApiError";

export const requireAuth=(req:Request,res:Response,next:NextFunction)=>{
    const auth=getAuth(req);
    if(!auth.userId){
        return next(new ApiError(401,"Unauthorized: Please login to continue!"));
    }
    next();
}

