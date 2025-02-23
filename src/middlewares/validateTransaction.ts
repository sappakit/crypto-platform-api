import { Request, Response, NextFunction } from "express";
import { CryptoTransactionType } from "@prisma/client";

export const validateCryptoTransactionData = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { receiver_wallet_id, transaction_type, external_address } = req.body;

  // Validate transaction type
  const validTransactionTypes = Object.values(
    CryptoTransactionType
  ) as string[];

  if (!validTransactionTypes.includes(transaction_type)) {
    res.status(400).json({
      error: "transaction_type must be INTERNAL or EXTERNAL",
    });

    return;
  }

  // INTERNAL transactions check
  if (transaction_type === "INTERNAL") {
    if (!receiver_wallet_id) {
      res.status(400).json({
        error: "Receiver wallet ID is required for INTERNAL transactions",
      });
      return;
    }

    if (external_address) {
      res.status(400).json({
        error: "External address must be NULL for INTERNAL transactions",
      });
      return;
    }
  }

  // EXTERNAL transactions check
  if (transaction_type === "EXTERNAL") {
    if (!external_address) {
      res.status(400).json({
        error: "External address is required for EXTERNAL transactions",
      });

      return;
    }

    if (receiver_wallet_id) {
      res.status(400).json({
        error: "Receiver wallet must be NULL for EXTERNAL transactions",
      });

      return;
    }
  }

  next();
};
