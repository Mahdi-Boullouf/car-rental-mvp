import { Router } from "express";
import { validate } from "../middlewares/validate";
import { isLoggedIn } from "../middlewares/auth";
import { login, loginSchema, me } from "../controllers/auth.controller";

const router = Router();

router.post("/login", validate(loginSchema), login);
router.get("/me", isLoggedIn, me);

export default router;
