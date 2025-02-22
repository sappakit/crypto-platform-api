import { Router } from "express";
import {
  getCurrencies,
  getCurrencyById,
  addCurrency,
  updateCurrency,
  deleteCurrency,
} from "../controllers/currencyController";
import { validateCurrencyData } from "../middlewares/validateCurrency";

const currencyRouter = Router();

currencyRouter.get("/", getCurrencies); // Get all currencies
currencyRouter.get("/:id", getCurrencyById); // Get currency by ID
currencyRouter.post("/", validateCurrencyData, addCurrency); // Add a new currency
currencyRouter.put("/:id", validateCurrencyData, updateCurrency); // Update a currency
currencyRouter.delete("/:id", deleteCurrency); // Delete currency by ID

export default currencyRouter;
