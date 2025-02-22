import { Request, Response, NextFunction } from "express";

export const validateUserData = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, password, email, name } = req.body;

  // Missing fields check
  if (!username || !password || !email || !name) {
    res.status(400).json({
      error: "Missing data fields (username, password, email, name)",
    });

    return;
  }

  // Fields type check
  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    typeof email !== "string" ||
    typeof name !== "string"
  ) {
    res.status(400).json({
      error: "All fields must be strings",
    });

    return;
  }

  // Password length check
  if (password.length < 6) {
    res.status(400).json({
      error: "Password must be at least 6 characters long",
    });

    return;
  }

  next();
};
