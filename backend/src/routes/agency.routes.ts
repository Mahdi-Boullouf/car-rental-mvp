import { Router } from "express";
import { validate } from "../middlewares/validate";
import { isSuperAdmin } from "../middlewares/auth";
import {
    listAgencies, createAgency, updateAgency, deleteAgency,
    createAgencySchema, updateAgencySchema,
} from "../controllers/agency.controller";

const router = Router();

router.get("/", isSuperAdmin, listAgencies);
router.post("/", isSuperAdmin, validate(createAgencySchema), createAgency);
router.put("/:id", isSuperAdmin, validate(updateAgencySchema), updateAgency);
router.delete("/:id", isSuperAdmin, deleteAgency);

export default router;
