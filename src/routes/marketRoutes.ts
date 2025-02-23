import { Router } from "express";
import {
  createSellOrder,
  getSellOrderById,
  getSellOrders,
} from "../controllers/market/sellController";
import {
  createBuyOrder,
  getBuyOrderById,
  getBuyOrders,
} from "../controllers/market/buyController";

const marketRouter = Router();

// Sell routes
marketRouter.get("/sell", getSellOrders); // Get all sell orders
marketRouter.get("/sell/:id", getSellOrderById); // Get sell order by ID
marketRouter.post("/sell", createSellOrder); // Create a new sell order

// Buy routes
marketRouter.get("/buy", getBuyOrders); // Get all buys orders
marketRouter.get("/buy/:id", getBuyOrderById); // Get buy order by ID
marketRouter.post("/buy", createBuyOrder); // Create a new buy order

export default marketRouter;
