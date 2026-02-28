import bcrypt from "bcryptjs";
import pool from "../utils/db";
import { AppError } from "../utils/appError";

export class ProfileService {
  async getProfile(userId: string) {
    const result = await pool.query(
      'SELECT id, name, email, created_at as "createdAt", updated_at as "updatedAt" FROM users WHERE id = $1',
      [userId]
    );
    if (result.rows.length === 0) throw new AppError("User not found", 404);
    return result.rows[0];
  }

  async updateProfile(userId: string, data: { name?: string; password?: string; currentPassword?: string }) {
    if (data.password) {
      if (!data.currentPassword) throw new AppError("Current password is required", 400);
      const userResult = await pool.query("SELECT password FROM users WHERE id = $1", [userId]);
      if (userResult.rows.length === 0) throw new AppError("User not found", 404);
      const isValid = await bcrypt.compare(data.currentPassword!, (userResult.rows[0] as Record<string, string>)["password"] ?? "");
      if (!isValid) throw new AppError("Current password is incorrect", 400);
    }

    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.name) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.password) {
      const hashed = await bcrypt.hash(data.password, 12);
      updates.push(`password = $${paramIndex++}`);
      values.push(hashed);
    }

    if (updates.length === 0) throw new AppError("No fields to update", 400);

    updates.push(`updated_at = NOW()`);
    values.push(userId);

    const result = await pool.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING id, name, email, created_at as "createdAt", updated_at as "updatedAt"`,
      values
    );
    return result.rows[0];
  }
}

export const profileService = new ProfileService();
