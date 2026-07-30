import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import prisma from "../db";
import { AppError } from "../errors/app_error";

function verifyToken(req: Request): JwtPayload {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        throw new AppError("You are not logged in", 401);
    }
    try {
        return jwt.verify(header.split("Bearer ")[1], process.env.JWT!) as JwtPayload;
    } catch {
        throw new AppError("Invalid token", 401);
    }
}

/** Any authenticated user. */
export const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
    req.user = verifyToken(req);
    next();
};

/** Platform super-admin only. */
export const isSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
    const decoded = verifyToken(req);
    if (decoded.role !== "SUPER_ADMIN") throw new AppError("You are not authorized", 403);
    req.user = decoded;
    next();
};

/** Agency staff (OWNER/AGENT). Loads the (active) agency and scopes the request. */
export const requireAgency = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const decoded = verifyToken(req);
        if (decoded.role !== "OWNER" && decoded.role !== "AGENT") {
            throw new AppError("You are not authorized", 403);
        }
        if (!decoded.agencyId) throw new AppError("No agency", 403);
        const agency = await prisma.agency.findUnique({ where: { id: decoded.agencyId } });
        if (!agency) throw new AppError("Agency not found", 404);
        if (!agency.active) throw new AppError("Agence suspendue, veuillez contacter l'administration", 403);
        req.user = decoded;
        req.agency = agency;
        req.agencyId = agency.id;
        next();
    } catch (error) {
        next(error);
    }
};

/** Gate a route on an enabled module. Must run after requireAgency. */
export const requireModule = (mod: "rentals" | "sales") => (req: Request, res: Response, next: NextFunction) => {
    const enabled = mod === "rentals" ? req.agency?.rentalsEnabled : req.agency?.salesEnabled;
    if (!enabled) throw new AppError("Cette fonctionnalité n'est pas activée pour votre compte", 403);
    next();
};
