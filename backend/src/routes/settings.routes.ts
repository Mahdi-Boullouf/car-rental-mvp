import { Router } from "express";
import { validate } from "../middlewares/validate";
import { isLoggedIn } from "../middlewares/auth";
import { getSettings, updateSettings, settingsSchema } from "../controllers/settings.controller";

const router = Router();

router.get("/", getSettings);
router.put("/", isLoggedIn, validate(settingsSchema), updateSettings);

export default router;
