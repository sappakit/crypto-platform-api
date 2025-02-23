import { Router } from "express";
import {
  createCryptoTransaction,
  getCryptoTransaction,
  getCryptoTransactionById,
} from "../controllers/transaction/cryptoTransactionController";
import {
  validateCryptoTransactionData,
  validateFiatTransactionData,
} from "../middlewares/validateTransaction";
import {
  createFiatTransaction,
  getFiatTransaction,
  getFiatTransactionById,
} from "../controllers/transaction/fiatTransactionController";

const transactionRouter = Router();

// Crypto transaction
transactionRouter.get("/crypto", getCryptoTransaction); // Get all crypto transactions
transactionRouter.get("/crypto/:id", getCryptoTransactionById); // Get crypto transaction by ID
transactionRouter.post(
  "/crypto",
  validateCryptoTransactionData,
  createCryptoTransaction
); // Create a new crypto transaction

// Fiat transaction
transactionRouter.get("/fiat", getFiatTransaction); // Get all fiat transactions
transactionRouter.get("/fiat/:id", getFiatTransactionById); // Get fiat transaction by ID
transactionRouter.post(
  "/fiat",
  validateFiatTransactionData,
  createFiatTransaction
); // Create a new fiat transaction

export default transactionRouter;
