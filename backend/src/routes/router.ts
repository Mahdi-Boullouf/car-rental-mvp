import { Router } from "express";

const router = Router();

import authRoutes from "./auth.routes";
import carRoutes from "./car.routes";
import bookingRoutes from "./booking.routes";
import saleRoutes from "./sale.routes";
import uploadRoutes from "./upload.routes";
import settingsRoutes from "./settings.routes";

router.use("/auth", authRoutes);
router.use("/cars", carRoutes);
router.use("/bookings", bookingRoutes);
router.use("/sales", saleRoutes);
router.use("/uploads", uploadRoutes);
router.use("/settings", settingsRoutes);

export default router;
