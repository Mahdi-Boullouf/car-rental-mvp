import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../db";
import { AppError } from "../errors/app_error";

export const loginSchema = z.object({
    email: z.string().regex(/^\S+@\S+\.\S+$/, "Invalid email"),
    password: z.string().min(1),
});

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body as { email: string; password: string };
        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user) throw new AppError("Invalid email or password", 401);

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) throw new AppError("Invalid email or password", 401);

        // Agency owners/agents can't log in if their agency is suspended.
        if (user.agencyId) {
            const agency = await prisma.agency.findUnique({ where: { id: user.agencyId } });
            if (!agency || !agency.active) throw new AppError("الوكالة موقوفة، يرجى التواصل مع الإدارة", 403);
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name, agencyId: user.agencyId },
            process.env.JWT!
        );

        res.json({
            success: true,
            data: {
                token,
                user: { id: user.id, name: user.name, email: user.email, role: user.role, agencyId: user.agencyId },
            },
        });
    } catch (error) {
        next(error);
    }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.user === "string" || !req.user) throw new AppError("Invalid token", 401);
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: { agency: true },
        });
        if (!user) throw new AppError("User not found", 404);
        res.json({
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                agency: user.agency
                    ? {
                          id: user.agency.id,
                          name: user.agency.name,
                          slug: user.agency.slug,
                          rentalsEnabled: user.agency.rentalsEnabled,
                          salesEnabled: user.agency.salesEnabled,
                          active: user.agency.active,
                      }
                    : null,
            },
        });
    } catch (error) {
        next(error);
    }
};
