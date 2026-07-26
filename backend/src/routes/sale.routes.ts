import { Router } from "express";
import { validate } from "../middlewares/validate";
import { isLoggedIn } from "../middlewares/auth";
import {
    listSales,
    getSale,
    createSale,
    updateSale,
    setSold,
    deleteSale,
    saleSchema,
    saleUpdateSchema,
    soldSchema,
} from "../controllers/sale.controller";

const router = Router();

router.get("/", listSales);
router.get("/:id", getSale);
router.post("/", isLoggedIn, validate(saleSchema), createSale);
router.put("/:id", isLoggedIn, validate(saleUpdateSchema), updateSale);
router.patch("/:id/sold", isLoggedIn, validate(soldSchema), setSold);
router.delete("/:id", isLoggedIn, deleteSale);

export default router;
