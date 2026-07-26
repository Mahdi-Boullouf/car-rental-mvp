import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app_error";

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Error : ", err);
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    return res.status(500).json({ success: false, message: "Internal server error" });
};
