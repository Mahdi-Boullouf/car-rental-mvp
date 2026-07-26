import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../db";

export const settingsSchema = z.object({
    logo: z.string().nullish(),
    cover: z.string().nullish(),
});

/** Public: showroom branding (logo + cover). Creates the singleton on first read. */
export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let settings = await prisma.storeSettings.findUnique({ where: { id: 1 } });
        if (!settings) settings = await prisma.storeSettings.create({ data: { id: 1 } });
        res.json({ success: true, data: settings });
    } catch (error) {
        next(error);
    }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { logo, cover } = req.body as { logo?: string | null; cover?: string | null };
        const settings = await prisma.storeSettings.upsert({
            where: { id: 1 },
            update: {
                ...(logo !== undefined ? { logo } : {}),
                ...(cover !== undefined ? { cover } : {}),
            },
            create: { id: 1, logo: logo ?? null, cover: cover ?? null },
        });
        res.json({ success: true, data: settings });
    } catch (error) {
        next(error);
    }
};
