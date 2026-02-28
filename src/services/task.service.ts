import prisma from "../utils/prisma";
import { AppError } from "../utils/appError";
import type { Prisma } from "@prisma/client";

interface TaskQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface CreateTaskInput {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string | null;
}

interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: string;
  priority?: string;
  dueDate?: string | null;
}

const ALLOWED_SORT_FIELDS = new Set([
  "createdAt",
  "updatedAt",
  "title",
  "status",
  "priority",
  "dueDate",
]);

export class TaskService {
  async create(userId: string, data: CreateTaskInput) {
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        status: (data.status as Prisma.TaskCreateInput["status"]) ?? "PENDING",
        priority: (data.priority as Prisma.TaskCreateInput["priority"]) ?? "MEDIUM",
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        userId,
      },
    });

    return task;
  }

  async findAll(userId: string, query: TaskQueryParams) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;

    const where: Prisma.TaskWhereInput = { userId };

    if (query.status) {
      where.status = query.status as Prisma.TaskWhereInput["status"];
    }

    if (query.priority) {
      where.priority = query.priority as Prisma.TaskWhereInput["priority"];
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const sortField = ALLOWED_SORT_FIELDS.has(query.sortBy ?? "") ? query.sortBy! : "createdAt";
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

    const orderBy: Prisma.TaskOrderByWithRelationInput = {
      [sortField]: sortOrder,
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return {
      tasks,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(userId: string, taskId: string) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    return task;
  }

  async update(userId: string, taskId: string, data: UpdateTaskInput) {
    await this.findById(userId, taskId);

    const updateData: Prisma.TaskUpdateInput = {};

    if (data.title !== undefined) {
      updateData.title = data.title;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.status !== undefined) {
      updateData.status = data.status as Prisma.TaskUpdateInput["status"];
    }
    if (data.priority !== undefined) {
      updateData.priority = data.priority as Prisma.TaskUpdateInput["priority"];
    }
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });

    return task;
  }

  async delete(userId: string, taskId: string) {
    await this.findById(userId, taskId);

    await prisma.task.delete({
      where: { id: taskId },
    });
  }
}

export const taskService = new TaskService();
