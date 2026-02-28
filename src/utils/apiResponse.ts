import type { Response } from "express";

interface ApiResponseData {
  success: boolean;
  message: string;
  data?: unknown;
  meta?: unknown;
}

export function sendSuccess(res: Response, data: unknown, message = "Success", statusCode = 200, meta?: unknown): void {
  const response: ApiResponseData = { success: true, message, data };
  if (meta) response.meta = meta;
  res.status(statusCode).json(response);
}

export function sendError(res: Response, message: string, statusCode = 500): void {
  res.status(statusCode).json({ success: false, message });
}
