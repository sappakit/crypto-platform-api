import { Request, Response, NextFunction } from "express";

export const validateWalletData = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { currency_id, balance } = req.body;
  const isCreateReq = req.method === "POST";

  if (isCreateReq) {
    // Missing fields check
    if (!currency_id || !balance) {
      res.status(400).json({
        error: "Missing data fields (currency_id, balance)",
      });

      return;
    }

    // Fields type check
    if (typeof currency_id !== "number" || typeof balance !== "number") {
      res.status(400).json({
        error: "All fields must be number",
      });

      return;
    }
  } else {
    // Missing fields check
    if (!balance) {
      res.status(400).json({
        error: "Missing data field (balance)",
      });

      return;
    }

    // Fields type check
    if (typeof balance !== "number") {
      res.status(400).json({
        error: "Field must be number",
      });

      return;
    }
  }

  next();
};
