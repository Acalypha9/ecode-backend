import bcrypt from "bcryptjs";
import prisma from "../utils/prisma";
import { AppError } from "../utils/appError";

export class ProfileService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) throw new AppError("User not found", 404);

    return user;
  }

  async updateProfile(userId: string, data: { name?: string; password?: string; currentPassword?: string }) {
    if (data.password) {
      if (!data.currentPassword) throw new AppError("Current password is required", 400);

      const userWithPassword = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
      });

      if (!userWithPassword) throw new AppError("User not found", 404);

      const isValid = await bcrypt.compare(data.currentPassword, userWithPassword.password);
      if (!isValid) throw new AppError("Current password is incorrect", 400);
    }

    const updateData: { name?: string; password?: string } = {};

    if (data.name) {
      updateData.name = data.name;
    }
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12);
    }

    if (Object.keys(updateData).length === 0) throw new AppError("No fields to update", 400);

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }
}

export const profileService = new ProfileService();
