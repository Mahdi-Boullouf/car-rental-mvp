import { Router } from "express";
import { validate } from "../middlewares/validate";
import { requireAgency, requireModule } from "../middlewares/auth";
import { listBookings, createBooking, deleteBooking, bookingSchema } from "../controllers/booking.controller";

const router = Router();
const rentals = [requireAgency, requireModule("rentals")];

router.get("/", ...rentals, listBookings);
router.post("/", ...rentals, validate(bookingSchema), createBooking);
router.delete("/:id", ...rentals, deleteBooking);

export default router;
