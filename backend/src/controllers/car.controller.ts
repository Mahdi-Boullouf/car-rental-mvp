import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../db";
import { AppError } from "../errors/app_error";

export const carSchema = z.object({
    name: z.string().min(1),
    bodyType: z.string().min(1),
    year: z.number().int().min(1950).max(2100),
    fuel: z.string().min(1),
    transmission: z.string().min(1),
    seats: z.number().int().positive(),
    pricePerDay: z.number().int().positive(),
    image: z.string().min(1),
});

export const carUpdateSchema = carSchema.partial();

export const listCars = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cars = await prisma.car.findMany({ where: { agencyId: req.agencyId }, orderBy: { createdAt: "asc" } });
        res.json({ success: true, data: cars });
    } catch (error) {
        next(error);
    }
};

export const getCar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const car = await prisma.car.findFirst({ where: { id: req.params.id, agencyId: req.agencyId } });
        if (!car) throw new AppError("Car not found", 404);
        res.json({ success: true, data: car });
    } catch (error) {
        next(error);
    }
};

export const createCar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const car = await prisma.car.create({ data: { ...req.body, agencyId: req.agencyId! } });
        res.status(201).json({ success: true, data: car });
    } catch (error) {
        next(error);
    }
};

export const updateCar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const existing = await prisma.car.findFirst({ where: { id: req.params.id, agencyId: req.agencyId } });
        if (!existing) throw new AppError("Car not found", 404);
        const car = await prisma.car.update({ where: { id: existing.id }, data: req.body });
        res.json({ success: true, data: car });
    } catch (error) {
        next(error);
    }
};

export const deleteCar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const existing = await prisma.car.findFirst({ where: { id: req.params.id, agencyId: req.agencyId } });
        if (!existing) throw new AppError("Car not found", 404);
        await prisma.car.delete({ where: { id: existing.id } });
        res.json({ success: true, message: "Car deleted" });
    } catch (error) {
        next(error);
    }
};
