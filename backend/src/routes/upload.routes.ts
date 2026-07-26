import { Router } from "express";
import { requireAgency } from "../middlewares/auth";
import { uploadMiddleware } from "../middlewares/upload";
import { uploadImages } from "../controllers/upload.controller";

const router = Router();

// POST /api/uploads  (multipart, field "images", up to 10) -> { paths: ["/uploads/..."] }
router.post("/", requireAgency, uploadMiddleware.array("images", 10), uploadImages);

export default router;
