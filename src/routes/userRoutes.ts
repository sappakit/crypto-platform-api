import { Router } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController";

const userRouter = Router();

userRouter.get("/", getUsers); // Get all users
userRouter.get("/:id", getUserById); // Get user by ID
userRouter.post("/", createUser); // Create a new user
userRouter.put("/:id", updateUser); // Update a user
userRouter.delete("/:id", deleteUser); // Delete user by ID

export default userRouter;
