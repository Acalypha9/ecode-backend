import type { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { sendSuccess, sendError } from "../utils/apiResponse";

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body as { name: unknown; email: unknown; password: unknown };

      if (!name || typeof name !== "string" || name.length < 2) {
        sendError(res, "Name must be at least 2 characters", 400);
        return;
      }
      if (!email || typeof email !== "string" || !email.includes("@")) {
        sendError(res, "Valid email is required", 400);
        return;
      }
      if (!password || typeof password !== "string" || password.length < 6) {
        sendError(res, "Password must be at least 6 characters", 400);
        return;
      }

      const result = await authService.register({ name, email, password });
      sendSuccess(res, result, "User registered successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body as { email: unknown; password: unknown };

      if (!email || !password) {
        sendError(res, "Email and password are required", 400);
        return;
      }

      const result = await authService.login({ email: email as string, password: password as string });
      sendSuccess(res, result, "Login successful");
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
