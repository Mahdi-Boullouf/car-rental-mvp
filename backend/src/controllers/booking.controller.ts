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

/** Staff: all bookings, newest range first, with the car attached. */
export const listBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bookings = await prisma.booking.findMany({
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
        if (end < start) throw new AppError("تاريخ النهاية قبل تاريخ البداية", 400);

        const car = await prisma.car.findUnique({ where: { id: carId } });
        if (!car) throw new AppError("Car not found", 404);

        // Two closed ranges overlap iff existing.start <= newEnd && existing.end >= newStart.
        const conflict = await prisma.booking.findFirst({
            where: { carId, startDate: { lte: end }, endDate: { gte: start } },
        });
        if (conflict) {
            throw new AppError(
                `هذه السيارة محجوزة بالفعل من ${fmt(conflict.startDate)} إلى ${fmt(conflict.endDate)} باسم ${conflict.customer}`,
                409
            );
        }

        const booking = await prisma.booking.create({
            data: { carId, customer, startDate: start, endDate: end },
            include: { car: true },
        });
        res.status(201).json({ success: true, data: booking });
    } catch (error) {
        next(error);
    }
};

export const deleteBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const existing = await prisma.booking.findUnique({ where: { id } });
        if (!existing) throw new AppError("Booking not found", 404);
        await prisma.booking.delete({ where: { id } });
        res.json({ success: true, message: "Booking deleted" });
    } catch (error) {
        next(error);
    }
};
