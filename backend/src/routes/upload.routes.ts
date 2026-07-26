import { Router } from "express";
import { isLoggedIn } from "../middlewares/auth";
import { uploadMiddleware } from "../middlewares/upload";
import { uploadImages } from "../controllers/upload.controller";

const router = Router();

// POST /api/uploads  (multipart, field "images", up to 10) -> { paths: ["/uploads/..."] }
router.post("/", isLoggedIn, uploadMiddleware.array("images", 10), uploadImages);

export default router;
