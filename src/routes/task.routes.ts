import { Router } from "express";
import { taskController } from "../controllers/task.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.post("/", (req, res, next) => taskController.create(req, res, next));
router.get("/", (req, res, next) => taskController.findAll(req, res, next));
router.get("/:id", (req, res, next) => taskController.findById(req, res, next));
router.put("/:id", (req, res, next) => taskController.update(req, res, next));
router.delete("/:id", (req, res, next) => taskController.delete(req, res, next));

export default router;
