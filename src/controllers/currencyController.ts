import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

// Get all currencies
export const getCurrencies = async (req: Request, res: Response) => {
  try {
    const currencies = await prisma.currency.findMany();

    res.status(200).json({
      data: currencies,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to fetch currencies",
    });
  }
};

// Get currency by ID
export const getCurrencyById = async (req: Request, res: Response) => {
  const currencyId = Number(req.params.id);

  try {
    const currency = await prisma.currency.findUnique({
      where: { currency_id: currencyId },
    });

    if (!currency) {
      res.status(404).json({
        error: "Currency not found",
      });

      return;
    }

    res.status(200).json({
      data: currency,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to fetch the currency",
    });
  }
};

// Add a new currency
export const addCurrency = async (req: Request, res: Response) => {
  const { currency_type, currency_code, currency_name } = req.body;

  try {
    await prisma.currency.create({
      data: { currency_type, currency_code, currency_name },
    });

    res.status(200).json({
      message: "Add currency successfully",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      error: "Failed to add currency",
    });
  }
};

// Update a currency
export const updateCurrency = async (req: Request, res: Response) => {
  const currencyId = Number(req.params.id);
  const { currency_type, currency_code, currency_name } = req.body;

  try {
    // Currency check
    const currency = await prisma.currency.findUnique({
      where: { currency_id: currencyId },
    });

    if (!currency) {
      res.status(404).json({
        error: "Currency not found",
      });

      return;
    }

    // Update currency data
    await prisma.currency.update({
      where: { currency_id: currencyId },
      data: { currency_type, currency_code, currency_name },
    });

    res.status(200).json({
      message: "Update currency successfully.",
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to update currency",
    });
  }
};

// Delete a currency
export const deleteCurrency = async (req: Request, res: Response) => {
  const currencyId = Number(req.params.id);

  try {
    // Currency check
    const currency = await prisma.currency.findUnique({
      where: { currency_id: currencyId },
    });

    if (!currency) {
      res.status(404).json({
        error: "currency not found",
      });

      return;
    }

    // Delete currency
    await prisma.currency.delete({
      where: { currency_id: currencyId },
    });

    res.status(200).json({
      message: "Currency has been deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to delete the currency",
    });
  }
};
