import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../db";
import { AppError } from "../errors/app_error";

export const saleSchema = z.object({
    title: z.string().min(1),
    brand: z.string().optional().default(""),
    model: z.string().optional().default(""),
    year: z.number().int().nullish(),
    price: z.number().int().nonnegative(),
    km: z.number().int().nullish(),
    fuel: z.string().optional().default(""),
    gearbox: z.string().optional().default(""),
    color: z.string().optional().default(""),
    phone: z.string().optional().default(""),
    wilaya: z.string().optional().default(""),
    description: z.string().optional().default(""),
    images: z.array(z.string()).optional().default([]),
});

export const saleUpdateSchema = saleSchema.partial();
export const soldSchema = z.object({ sold: z.boolean() });

/** Public: list sale listings, optional ?q= and ?status=available|sold. */
export const listSales = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const q = (req.query.q as string | undefined)?.trim();
        const status = req.query.status as string | undefined;
        const sales = await prisma.saleListing.findMany({
            where: {
                ...(status === "available" ? { sold: false } : {}),
                ...(status === "sold" ? { sold: true } : {}),
                ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
            },
            orderBy: { createdAt: "desc" },
        });
        res.json({ success: true, data: sales });
    } catch (error) {
        next(error);
    }
};

/** Public: a single sale listing. */
export const getSale = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sale = await prisma.saleListing.findUnique({ where: { id: req.params.id } });
        if (!sale) throw new AppError("Listing not found", 404);
        res.json({ success: true, data: sale });
    } catch (error) {
        next(error);
    }
};

export const createSale = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sale = await prisma.saleListing.create({ data: req.body });
        res.status(201).json({ success: true, data: sale });
    } catch (error) {
        next(error);
    }
};

export const updateSale = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const existing = await prisma.saleListing.findUnique({ where: { id } });
        if (!existing) throw new AppError("Listing not found", 404);
        const sale = await prisma.saleListing.update({ where: { id }, data: req.body });
        res.json({ success: true, data: sale });
    } catch (error) {
        next(error);
    }
};

export const setSold = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const existing = await prisma.saleListing.findUnique({ where: { id } });
        if (!existing) throw new AppError("Listing not found", 404);
        const sale = await prisma.saleListing.update({
            where: { id },
            data: { sold: req.body.sold },
        });
        res.json({ success: true, data: sale });
    } catch (error) {
        next(error);
    }
};

export const deleteSale = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const existing = await prisma.saleListing.findUnique({ where: { id } });
        if (!existing) throw new AppError("Listing not found", 404);
        await prisma.saleListing.delete({ where: { id } });
        res.json({ success: true, message: "Listing deleted" });
    } catch (error) {
        next(error);
    }
};
