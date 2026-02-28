import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import pool from "../utils/db";
import { config } from "../config";
import { AppError } from "../utils/appError";

export class AuthService {
  async register(data: { name: string; email: string; password: string }) {
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [data.email]
    );

    if (existing.rows.length > 0) {
      throw new AppError("Email already registered", 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const result = await pool.query(
      `INSERT INTO users (id, name, email, password, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
       RETURNING id, name, email, created_at as "createdAt"`,
      [data.name, data.email, hashedPassword]
    );

    const user = result.rows[0] as { id: string; name: string; email: string; createdAt: Date };
    const token = this.generateToken(user.id);

    return { user, token };
  }

  async login(data: { email: string; password: string }) {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [data.email]
    );

    if (result.rows.length === 0) {
      throw new AppError("Invalid email or password", 401);
    }

    const user = result.rows[0] as { id: string; name: string; email: string; password: string; created_at: Date };

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = this.generateToken(user.id);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at,
      },
      token,
    };
  }

  private generateToken(userId: string): string {
    const options: SignOptions = { expiresIn: config.jwt.expiresIn as SignOptions["expiresIn"] };
    return jwt.sign({ userId }, config.jwt.secret, options);
  }
}

export const authService = new AuthService();
