import { Router } from "express";
import {
  createCryptoTransaction,
  getCryptoTransaction,
  getCryptoTransactionById,
} from "../controllers/transaction/cryptoTransactionController";
import { validateCryptoTransactionData } from "../middlewares/validateTransaction";

const transactionRouter = Router();

// Crypto transaction
transactionRouter.get("/crypto", getCryptoTransaction); // Get all crypto transaction
transactionRouter.get("/crypto/:id", getCryptoTransactionById); // Get crypto transaction by ID

// Create a new crypto transaction
transactionRouter.post(
  "/crypto",
  validateCryptoTransactionData,
  createCryptoTransaction
);

export default transactionRouter;
