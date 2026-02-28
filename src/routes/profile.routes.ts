import { Router } from "express";
import { profileController } from "../controllers/profile.controller";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/", (req, res, next) => profileController.getProfile(req, res, next));
router.put("/", (req, res, next) => profileController.updateProfile(req, res, next));

export default router;
