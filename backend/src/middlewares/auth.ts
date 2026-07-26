import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app_error";
import jwt, { JwtPayload } from "jsonwebtoken";

/** Any authenticated staff member (ADMIN or AGENT). */
export const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        throw new AppError("You are not logged in", 401);
    }
    const token = header.split("Bearer ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT!) as JwtPayload;
        req.user = decoded;
        next();
    } catch (error) {
        throw new AppError("Invalid token", 401);
    }
};

/** ADMIN-only routes. */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        throw new AppError("You are not logged in", 401);
    }
    const token = header.split("Bearer ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT!) as JwtPayload;
        if (decoded.role !== "ADMIN") {
            throw new AppError("You are not authorized", 403);
        }
        req.user = decoded;
        next();
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("Invalid token", 401);
    }
};
