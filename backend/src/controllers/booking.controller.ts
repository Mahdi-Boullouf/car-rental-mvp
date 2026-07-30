import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../db";
import { AppError } from "../errors/app_error";

export const bookingSchema = z.object({
    carId: z.string().min(1),
    customer: z.string().min(1),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
});

const fmt = (d: Date) => {
    const x = new Date(d);
    return `${String(x.getUTCDate()).padStart(2, "0")}/${String(x.getUTCMonth() + 1).padStart(2, "0")}/${x.getUTCFullYear()}`;
};

export const listBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bookings = await prisma.booking.findMany({
            where: { agencyId: req.agencyId },
            include: { car: true },
            orderBy: { startDate: "desc" },
        });
        res.json({ success: true, data: bookings });
    } catch (error) {
        next(error);
    }
};

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { carId, customer, startDate, endDate } = req.body as {
            carId: string;
            customer: string;
            startDate: string;
            endDate: string;
        };

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end < start) throw new AppError("La date de fin précède la date de début", 400);

        // Car must belong to this agency.
        const car = await prisma.car.findFirst({ where: { id: carId, agencyId: req.agencyId } });
        if (!car) throw new AppError("Car not found", 404);

        const conflict = await prisma.booking.findFirst({
            where: { carId, agencyId: req.agencyId, startDate: { lte: end }, endDate: { gte: start } },
        });
        if (conflict) {
            throw new AppError(
                `Cette voiture est déjà réservée du ${fmt(conflict.startDate)} au ${fmt(conflict.endDate)} au nom de ${conflict.customer}`,
                409
            );
        }

        const booking = await prisma.booking.create({
            data: { carId, agencyId: req.agencyId!, customer, startDate: start, endDate: end },
            include: { car: true },
        });
        res.status(201).json({ success: true, data: booking });
    } catch (error) {
        next(error);
    }
};

export const deleteBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const existing = await prisma.booking.findFirst({ where: { id: req.params.id, agencyId: req.agencyId } });
        if (!existing) throw new AppError("Booking not found", 404);
        await prisma.booking.delete({ where: { id: existing.id } });
        res.json({ success: true, message: "Booking deleted" });
    } catch (error) {
        next(error);
    }
};
