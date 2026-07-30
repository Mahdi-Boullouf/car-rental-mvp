import { Request, Response, NextFunction } from "express";
import { storeFile } from "../lib/storage";

/** Returns the public paths of uploaded images (field name: "images"). */
export const uploadImages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const files = (req.files as Express.Multer.File[]) || [];
        const paths = await Promise.all(files.map(storeFile));
        res.status(201).json({ success: true, data: { paths } });
    } catch (error) {
        next(error);
    }
};
