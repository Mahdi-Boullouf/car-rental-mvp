import { Router } from "express";
import { validate } from "../middlewares/validate";
import { requireAgency, requireModule } from "../middlewares/auth";
import { listCars, getCar, createCar, updateCar, deleteCar, carSchema, carUpdateSchema } from "../controllers/car.controller";

const router = Router();
const rentals = [requireAgency, requireModule("rentals")];

router.get("/", ...rentals, listCars);
router.get("/:id", ...rentals, getCar);
router.post("/", ...rentals, validate(carSchema), createCar);
router.put("/:id", ...rentals, validate(carUpdateSchema), updateCar);
router.delete("/:id", ...rentals, deleteCar);

export default router;
