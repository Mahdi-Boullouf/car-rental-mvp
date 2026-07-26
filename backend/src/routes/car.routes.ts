import { Router } from "express";
import { validate } from "../middlewares/validate";
import { isLoggedIn } from "../middlewares/auth";
import {
    listCars,
    getCar,
    createCar,
    updateCar,
    deleteCar,
    carSchema,
    carUpdateSchema,
} from "../controllers/car.controller";

const router = Router();

router.get("/", listCars);
router.get("/:id", getCar);
router.post("/", isLoggedIn, validate(carSchema), createCar);
router.put("/:id", isLoggedIn, validate(carUpdateSchema), updateCar);
router.delete("/:id", isLoggedIn, deleteCar);

export default router;
