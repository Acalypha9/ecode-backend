import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import { sendError } from "../utils/apiResponse";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  console.error("Unexpected error:", err);
  sendError(res, "Internal server error", 500);
}
