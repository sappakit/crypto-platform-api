import { Router } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController";
import {
  getWallets,
  getWalletBalance,
  createWallet,
  updateWallet,
  deleteWallet,
} from "../controllers/walletController";
import { validateUserData } from "../middlewares/validateUser";
import { validateWalletData } from "../middlewares/validateWallet";

const userRouter = Router();

// User routes
userRouter.get("/", getUsers); // Get all users
userRouter.get("/:id", getUserById); // Get user by ID
userRouter.post("/", validateUserData, createUser); // Create a new user
userRouter.put("/:id", validateUserData, updateUser); // Update a user
userRouter.delete("/:id", deleteUser); // Delete user by ID

// Wallet routes
userRouter.get("/:id/wallets", getWallets); // Get all user wallets
userRouter.get("/:id/wallets/:currencyId", getWalletBalance); // Get user wallet balance
userRouter.post("/:id/wallets", validateWalletData, createWallet); // Create a new user wallet
userRouter.put("/:id/wallets/:currencyId", validateWalletData, updateWallet); // Update wallet balance
userRouter.delete("/:id/wallets/:currencyId", deleteWallet); // Delete wallet by ID

export default userRouter;
