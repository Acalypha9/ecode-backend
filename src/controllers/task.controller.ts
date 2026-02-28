import type { Request, Response, NextFunction } from "express";
import { taskService } from "../services/task.service";
import { sendSuccess, sendError } from "../utils/apiResponse";

export class TaskController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { title } = req.body as { title: unknown };
      if (!title || typeof title !== "string" || title.trim().length === 0) {
        sendError(res, "Title is required", 400);
        return;
      }

      const task = await taskService.create(req.user!.userId, req.body as { title: string; description?: string; status?: string; priority?: string; dueDate?: string });
      sendSuccess(res, task, "Task created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = {
        page: req.query["page"] ? parseInt(req.query["page"] as string, 10) : undefined,
        limit: req.query["limit"] ? parseInt(req.query["limit"] as string, 10) : undefined,
        status: req.query["status"] as string | undefined,
        priority: req.query["priority"] as string | undefined,
        search: req.query["search"] as string | undefined,
        sortBy: req.query["sortBy"] as string | undefined,
        sortOrder: req.query["sortOrder"] as "asc" | "desc" | undefined,
      };

      const result = await taskService.findAll(req.user!.userId, query);
      sendSuccess(res, result.tasks, "Tasks retrieved successfully", 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.findById(req.user!.userId, req.params["id"] as string);
      sendSuccess(res, task, "Task retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.update(req.user!.userId, req.params["id"] as string, req.body as { title?: string; description?: string | null; status?: string; priority?: string; dueDate?: string | null });
      sendSuccess(res, task, "Task updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await taskService.delete(req.user!.userId, req.params["id"] as string);
      sendSuccess(res, null, "Task deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}

export const taskController = new TaskController();
