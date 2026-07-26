import { Router } from "express";
import { validate } from "../middlewares/validate";
import { requireAgency, requireModule } from "../middlewares/auth";
import {
    listSales, getSale, createSale, updateSale, setSold, deleteSale,
    saleSchema, saleUpdateSchema, soldSchema,
} from "../controllers/sale.controller";

const router = Router();
const sales = [requireAgency, requireModule("sales")];

router.get("/", ...sales, listSales);
router.get("/:id", ...sales, getSale);
router.post("/", ...sales, validate(saleSchema), createSale);
router.put("/:id", ...sales, validate(saleUpdateSchema), updateSale);
router.patch("/:id/sold", ...sales, validate(soldSchema), setSold);
router.delete("/:id", ...sales, deleteSale);

export default router;
