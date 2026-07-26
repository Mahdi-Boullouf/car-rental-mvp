import { Router } from "express";

const router = Router();

import authRoutes from "./auth.routes";
import agencyRoutes from "./agency.routes";
import carRoutes from "./car.routes";
import bookingRoutes from "./booking.routes";
import saleRoutes from "./sale.routes";
import uploadRoutes from "./upload.routes";
import settingsRoutes from "./settings.routes";
import publicRoutes from "./public.routes";

router.use("/auth", authRoutes);
router.use("/agencies", agencyRoutes); // super-admin
router.use("/cars", carRoutes); // agency + rentals module
router.use("/bookings", bookingRoutes); // agency + rentals module
router.use("/sales", saleRoutes); // agency + sales module
router.use("/uploads", uploadRoutes); // agency
router.use("/settings", settingsRoutes); // agency
router.use("/public", publicRoutes); // public, by slug

export default router;
