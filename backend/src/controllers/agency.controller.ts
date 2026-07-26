import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import prisma from "../db";
import { AppError } from "../errors/app_error";

export const createAgencySchema = z.object({
    name: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9-]+$/, "أحرف إنجليزية صغيرة وأرقام وشرطات فقط"),
    phone: z.string().optional().default(""),
    city: z.string().optional().default(""),
    rentalsEnabled: z.boolean().optional().default(true),
    salesEnabled: z.boolean().optional().default(true),
    ownerName: z.string().min(1),
    ownerEmail: z.string().regex(/^\S+@\S+\.\S+$/, "بريد غير صحيح"),
    ownerPassword: z.string().min(6, "كلمة المرور 6 أحرف على الأقل"),
});

export const updateAgencySchema = z
    .object({
        name: z.string().min(1),
        phone: z.string(),
        city: z.string(),
        active: z.boolean(),
        rentalsEnabled: z.boolean(),
        salesEnabled: z.boolean(),
    })
    .partial();

/** Super-admin: all agencies with owner + counts. */
export const listAgencies = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const agencies = await prisma.agency.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                users: { where: { role: "OWNER" }, select: { email: true, name: true }, take: 1 },
                _count: { select: { cars: true, sales: true } },
            },
        });
        res.json({
            success: true,
            data: agencies.map((a) => ({
                id: a.id, name: a.name, slug: a.slug, city: a.city, phone: a.phone,
                active: a.active, rentalsEnabled: a.rentalsEnabled, salesEnabled: a.salesEnabled,
                createdAt: a.createdAt,
                ownerName: a.users[0]?.name ?? null, ownerEmail: a.users[0]?.email ?? null,
                cars: a._count.cars, sales: a._count.sales,
            })),
        });
    } catch (error) {
        next(error);
    }
};

export const createAgency = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const b = req.body as z.infer<typeof createAgencySchema>;
        if (await prisma.agency.findUnique({ where: { slug: b.slug } }))
            throw new AppError("هذا الرابط (slug) مستخدم مسبقاً", 409);
        if (await prisma.user.findUnique({ where: { email: b.ownerEmail.toLowerCase() } }))
            throw new AppError("هذا البريد مسجّل مسبقاً", 409);

        const password = await bcrypt.hash(b.ownerPassword, 10);
        const agency = await prisma.$transaction(async (tx) => {
            const ag = await tx.agency.create({
                data: {
                    name: b.name, slug: b.slug, phone: b.phone, city: b.city,
                    rentalsEnabled: b.rentalsEnabled, salesEnabled: b.salesEnabled,
                },
            });
            await tx.user.create({
                data: { name: b.ownerName, email: b.ownerEmail.toLowerCase(), password, role: "OWNER", agencyId: ag.id },
            });
            await tx.storeSettings.create({ data: { agencyId: ag.id } });
            return ag;
        });

        res.status(201).json({ success: true, data: agency });
    } catch (error) {
        next(error);
    }
};

export const updateAgency = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const existing = await prisma.agency.findUnique({ where: { id: req.params.id } });
        if (!existing) throw new AppError("الوكالة غير موجودة", 404);
        const agency = await prisma.agency.update({ where: { id: existing.id }, data: req.body });
        res.json({ success: true, data: agency });
    } catch (error) {
        next(error);
    }
};

export const deleteAgency = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const existing = await prisma.agency.findUnique({ where: { id: req.params.id } });
        if (!existing) throw new AppError("الوكالة غير موجودة", 404);
        await prisma.agency.delete({ where: { id: existing.id } }); // cascades users/cars/sales/settings
        res.json({ success: true, message: "Agency deleted" });
    } catch (error) {
        next(error);
    }
};
