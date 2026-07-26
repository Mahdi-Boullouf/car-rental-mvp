import { ZodObject } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate = (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: "Validation error",
            errors: result.error.flatten(),
        });
    }

    // Replace req.body with validated and typed data
    req.body = result.data;

    next();
};
