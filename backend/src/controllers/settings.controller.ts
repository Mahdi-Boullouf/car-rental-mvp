import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../db";

export const settingsSchema = z.object({
    logo: z.string().nullish(),
    cover: z.string().nullish(),
});

/** Agency: its own showroom branding (creates the row on first read). */
export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const settings = await prisma.storeSettings.upsert({
            where: { agencyId: req.agencyId! },
            update: {},
            create: { agencyId: req.agencyId! },
        });
        res.json({ success: true, data: settings });
    } catch (error) {
        next(error);
    }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { logo, cover } = req.body as { logo?: string | null; cover?: string | null };
        const settings = await prisma.storeSettings.upsert({
            where: { agencyId: req.agencyId! },
            update: {
                ...(logo !== undefined ? { logo } : {}),
                ...(cover !== undefined ? { cover } : {}),
            },
            create: { agencyId: req.agencyId!, logo: logo ?? null, cover: cover ?? null },
        });
        res.json({ success: true, data: settings });
    } catch (error) {
        next(error);
    }
};
