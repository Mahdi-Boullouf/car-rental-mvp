import { Router } from "express";
import { getPublicAgency, listPublicSales, getPublicSale } from "../controllers/public.controller";

const router = Router();

// Public showroom, scoped by agency slug.
router.get("/:slug", getPublicAgency);
router.get("/:slug/sales", listPublicSales);
router.get("/:slug/sales/:id", getPublicSale);

export default router;
