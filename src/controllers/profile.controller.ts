import type { Request, Response, NextFunction } from "express";
import { profileService } from "../services/profile.service";
import { sendSuccess } from "../utils/apiResponse";

export class ProfileController {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await profileService.getProfile(req.user!.userId);
      sendSuccess(res, profile, "Profile retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await profileService.updateProfile(req.user!.userId, req.body);
      sendSuccess(res, profile, "Profile updated successfully");
    } catch (error) {
      next(error);
    }
  }
}

export const profileController = new ProfileController();
