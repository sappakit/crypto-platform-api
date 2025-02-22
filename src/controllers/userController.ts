import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

// Get all users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();

    res.status(200).json({
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to fetch users",
    });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  const userId = Number(req.params.id);

  try {
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      res.status(404).json({
        error: "User not found",
      });

      return;
    }

    res.status(200).json({
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to fetch the user",
    });
  }
};

// Create a new user
export const createUser = async (req: Request, res: Response) => {
  const { username, password, email, name } = req.body;

  try {
    await prisma.user.create({
      data: { username, password, email, name },
    });

    res.status(200).json({
      message: "Create user successfully",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      error: "Failed to create user",
    });
  }
};

// Update a user
export const updateUser = async (req: Request, res: Response) => {
  const userId = Number(req.params.id);
  const { username, password, email, name } = req.body;

  try {
    // User check
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      res.status(404).json({
        error: "User not found",
      });

      return;
    }

    // Update user data
    await prisma.user.update({
      where: { user_id: userId },
      data: { username, password, email, name },
    });

    res.status(200).json({
      message: "Update user successfully.",
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to update user",
    });
  }
};

// Delete a user
export const deleteUser = async (req: Request, res: Response) => {
  const userId = Number(req.params.id);

  try {
    // User check
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      res.status(404).json({
        error: "User not found",
      });

      return;
    }

    // Delete user
    await prisma.user.delete({
      where: { user_id: userId },
    });

    res.status(200).json({
      message: "User has been deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to delete the user",
    });
  }
};
