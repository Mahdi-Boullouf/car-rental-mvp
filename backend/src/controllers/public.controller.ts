import { Request, Response, NextFunction } from "express";
import prisma from "../db";
import { AppError } from "../errors/app_error";

async function activeAgencyBySlug(slug: string) {
    const agency = await prisma.agency.findUnique({ where: { slug } });
    if (!agency || !agency.active) throw new AppError("المعرض غير موجود", 404);
    return agency;
}

/** Public: an agency's showroom profile (branding + which modules are public). */
export const getPublicAgency = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const agency = await activeAgencyBySlug(req.params.slug);
        const settings = await prisma.storeSettings.findUnique({ where: { agencyId: agency.id } });
        res.json({
            success: true,
            data: {
                name: agency.name, slug: agency.slug, city: agency.city, phone: agency.phone,
                salesEnabled: agency.salesEnabled,
                logo: settings?.logo ?? null, cover: settings?.cover ?? null,
            },
        });
    } catch (error) {
        next(error);
    }
};

/** Public: an agency's sale listings. */
export const listPublicSales = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const agency = await activeAgencyBySlug(req.params.slug);
        if (!agency.salesEnabled) return res.json({ success: true, data: [] });
        const sales = await prisma.saleListing.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" } });
        res.json({ success: true, data: sales });
    } catch (error) {
        next(error);
    }
};

/** Public: a single sale listing within an agency. */
export const getPublicSale = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const agency = await activeAgencyBySlug(req.params.slug);
        const sale = await prisma.saleListing.findFirst({ where: { id: req.params.id, agencyId: agency.id } });
        if (!sale) throw new AppError("الإعلان غير موجود", 404);
        res.json({ success: true, data: sale });
    } catch (error) {
        next(error);
    }
};
