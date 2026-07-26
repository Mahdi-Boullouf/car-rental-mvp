import { Router } from "express";
import { validate } from "../middlewares/validate";
import { isLoggedIn } from "../middlewares/auth";
import {
    listBookings,
    createBooking,
    deleteBooking,
    bookingSchema,
} from "../controllers/booking.controller";

const router = Router();

router.get("/", isLoggedIn, listBookings);
router.post("/", isLoggedIn, validate(bookingSchema), createBooking);
router.delete("/:id", isLoggedIn, deleteBooking);

export default router;
