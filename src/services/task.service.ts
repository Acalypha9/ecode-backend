import pool from "../utils/db";
import { AppError } from "../utils/appError";

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

function mapTaskRow(row: Record<string, unknown>): Record<string, unknown> {
  return {
    id: row["id"],
    title: row["title"],
    description: row["description"],
    status: row["status"],
    priority: row["priority"],
    dueDate: row["due_date"],
    createdAt: row["created_at"],
    updatedAt: row["updated_at"],
    userId: row["user_id"],
  };
}

const ALLOWED_SORT_FIELDS: Record<string, string> = {
  createdAt: "created_at",
  updatedAt: "updated_at",
  title: "title",
  status: "status",
  priority: "priority",
  dueDate: "due_date",
};

export class TaskService {
  async create(userId: string, data: CreateTaskInput) {
    const result = await pool.query(
      `INSERT INTO tasks (id, title, description, status, priority, due_date, created_at, updated_at, user_id)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW(), $6)
       RETURNING *`,
      [
        data.title,
        data.description ?? null,
        data.status ?? "PENDING",
        data.priority ?? "MEDIUM",
        data.dueDate ? new Date(data.dueDate) : null,
        userId,
      ]
    );

    return mapTaskRow(result.rows[0] as Record<string, unknown>);
  }

  async findAll(userId: string, query: TaskQueryParams) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const offset = (page - 1) * limit;

    const conditions: string[] = ["user_id = $1"];
    const values: unknown[] = [userId];
    let paramIndex = 2;

    if (query.status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(query.status);
    }

    if (query.priority) {
      conditions.push(`priority = $${paramIndex++}`);
      values.push(query.priority);
    }

    if (query.search) {
      conditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      values.push(`%${query.search}%`);
      paramIndex++;
    }

    const whereClause = conditions.join(" AND ");

    const sortField = ALLOWED_SORT_FIELDS[query.sortBy ?? "createdAt"] ?? "created_at";
    const sortOrder = query.sortOrder === "asc" ? "ASC" : "DESC";

    const tasksResult = await pool.query(
      `SELECT * FROM tasks WHERE ${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...values, limit, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM tasks WHERE ${whereClause}`,
      values
    );

    const total = parseInt((countResult.rows[0] as Record<string, string>)["count"] ?? "0", 10);

    return {
      tasks: (tasksResult.rows as Record<string, unknown>[]).map(mapTaskRow),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(userId: string, taskId: string) {
    const result = await pool.query(
      "SELECT * FROM tasks WHERE id = $1 AND user_id = $2",
      [taskId, userId]
    );

    if (result.rows.length === 0) {
      throw new AppError("Task not found", 404);
    }

    return mapTaskRow(result.rows[0] as Record<string, unknown>);
  }

  async update(userId: string, taskId: string, data: UpdateTaskInput) {
    await this.findById(userId, taskId);

    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }
    if (data.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }
    if (data.priority !== undefined) {
      updates.push(`priority = $${paramIndex++}`);
      values.push(data.priority);
    }
    if (data.dueDate !== undefined) {
      updates.push(`due_date = $${paramIndex++}`);
      values.push(data.dueDate ? new Date(data.dueDate) : null);
    }

    updates.push(`updated_at = NOW()`);
    values.push(taskId);
    values.push(userId);

    const result = await pool.query(
      `UPDATE tasks SET ${updates.join(", ")} WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} RETURNING *`,
      values
    );

    return mapTaskRow(result.rows[0] as Record<string, unknown>);
  }

  async delete(userId: string, taskId: string) {
    await this.findById(userId, taskId);

    await pool.query(
      "DELETE FROM tasks WHERE id = $1 AND user_id = $2",
      [taskId, userId]
    );
  }
}

export const taskService = new TaskService();
