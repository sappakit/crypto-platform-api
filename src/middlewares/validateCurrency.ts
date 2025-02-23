import { Request, Response, NextFunction } from "express";
import { CurrencyType } from "@prisma/client";

export const validateCurrencyData = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { currency_type, currency_code, currency_name } = req.body;

  // Missing fields check
  if (!currency_type || !currency_code || !currency_name) {
    res.status(400).json({
      error:
        "Missing data fields (currency_type, currency_code, currency_name)",
    });

    return;
  }

  // Fields type check
  if (
    typeof currency_type !== "string" ||
    typeof currency_code !== "string" ||
    typeof currency_name !== "string"
  ) {
    res.status(400).json({
      error: "All fields must be strings",
    });

    return;
  }

  // currency_type value check
  const validCurrencyTypes = Object.values(CurrencyType) as string[];

  if (!validCurrencyTypes.includes(currency_type)) {
    res.status(400).json({
      error: "currency_type must be CRYPTO or FIAT",
    });

    return;
  }

  next();
};
