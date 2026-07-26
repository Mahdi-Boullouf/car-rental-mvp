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

/** Agency: its own listings. */
export const listSales = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sales = await prisma.saleListing.findMany({ where: { agencyId: req.agencyId }, orderBy: { createdAt: "desc" } });
        res.json({ success: true, data: sales });
    } catch (error) {
        next(error);
    }
};

export const getSale = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sale = await prisma.saleListing.findFirst({ where: { id: req.params.id, agencyId: req.agencyId } });
        if (!sale) throw new AppError("Listing not found", 404);
        res.json({ success: true, data: sale });
    } catch (error) {
        next(error);
    }
};

export const createSale = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sale = await prisma.saleListing.create({ data: { ...req.body, agencyId: req.agencyId! } });
        res.status(201).json({ success: true, data: sale });
    } catch (error) {
        next(error);
    }
};

export const updateSale = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const existing = await prisma.saleListing.findFirst({ where: { id: req.params.id, agencyId: req.agencyId } });
        if (!existing) throw new AppError("Listing not found", 404);
        const sale = await prisma.saleListing.update({ where: { id: existing.id }, data: req.body });
        res.json({ success: true, data: sale });
    } catch (error) {
        next(error);
    }
};

export const setSold = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const existing = await prisma.saleListing.findFirst({ where: { id: req.params.id, agencyId: req.agencyId } });
        if (!existing) throw new AppError("Listing not found", 404);
        const sale = await prisma.saleListing.update({ where: { id: existing.id }, data: { sold: req.body.sold } });
        res.json({ success: true, data: sale });
    } catch (error) {
        next(error);
    }
};

export const deleteSale = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const existing = await prisma.saleListing.findFirst({ where: { id: req.params.id, agencyId: req.agencyId } });
        if (!existing) throw new AppError("Listing not found", 404);
        await prisma.saleListing.delete({ where: { id: existing.id } });
        res.json({ success: true, message: "Listing deleted" });
    } catch (error) {
        next(error);
    }
};
