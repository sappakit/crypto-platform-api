import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

// Get all user wallets
export const getWallets = async (req: Request, res: Response) => {
  const userId = Number(req.params.id);

  try {
    const rawWalletsData = await prisma.user_Wallet.findMany({
      select: {
        wallet_id: true,
        user_id: true,
        balance: true,
        created_at: true,
        updated_at: true,
        currency: {
          select: { currency_code: true, currency_name: true },
        },
      },
      where: { user_id: userId },
    });

    // Remove nested object
    const wallets = rawWalletsData.map(({ currency, balance, ...rest }) => ({
      ...rest,
      balance: balance.toNumber(),
      currency_code: currency.currency_code,
      currency_name: currency.currency_name,
    }));

    res.status(200).json({
      data: wallets,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to fetch wallets",
    });
  }
};

// Get user wallet balance by currency ID
export const getWalletBalance = async (req: Request, res: Response) => {
  const userId = Number(req.params.id);
  const currencyId = Number(req.params.currencyId);

  try {
    const rawWalletData = await prisma.user_Wallet.findFirst({
      select: {
        wallet_id: true,
        user_id: true,
        balance: true,
        created_at: true,
        updated_at: true,
        currency: {
          select: { currency_code: true, currency_name: true },
        },
      },
      where: {
        currency_id: currencyId,
        user_id: userId,
      },
    });

    if (!rawWalletData) {
      res.status(404).json({
        error: "Wallet not found",
      });

      return;
    }

    // Remove nested object
    const { currency, ...wallet } = {
      ...rawWalletData,
      currency_code: rawWalletData.currency.currency_code,
      currency_name: rawWalletData.currency.currency_name,
    };

    res.status(200).json({
      data: wallet,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to fetch the wallet",
    });
  }
};

// Create a new wallet
export const createWallet = async (req: Request, res: Response) => {
  const userId = Number(req.params.id);
  const { currency_id, balance } = req.body;

  try {
    // Currency check
    const currencyCheck = await prisma.currency.findUnique({
      where: { currency_id: currency_id },
    });

    if (!currencyCheck) {
      res.status(404).json({
        error: "Currency not found",
      });

      return;
    }

    // Wallet check
    const walletCheck = await prisma.user_Wallet.findMany({
      where: { user_id: userId, currency_id: currency_id },
    });

    if (walletCheck.length > 0) {
      res.status(400).json({
        error: "Wallet already exist",
      });

      return;
    }

    await prisma.user_Wallet.create({
      data: { user_id: userId, currency_id, balance },
    });

    res.status(200).json({
      message: "Create wallet successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to create wallet",
    });
  }
};

// Update wallet balance
export const updateWallet = async (req: Request, res: Response) => {
  const userId = Number(req.params.id);
  const currencyId = Number(req.params.currencyId);

  const { balance } = req.body;

  try {
    // Wallet check
    const wallet = await prisma.user_Wallet.findFirst({
      where: {
        currency_id: currencyId,
        user_id: userId,
      },
      select: {
        wallet_id: true,
      },
    });

    if (!wallet) {
      res.status(404).json({
        error: "Wallet not found",
      });

      return;
    }

    // Update wallet balance
    await prisma.user_Wallet.update({
      data: { balance },
      where: {
        wallet_id: wallet.wallet_id,
      },
    });

    res.status(200).json({
      message: "Update wallet balance successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to update wallet balance",
    });
  }
};

// Delete a wallet
export const deleteWallet = async (req: Request, res: Response) => {
  const userId = Number(req.params.id);
  const currencyId = Number(req.params.currencyId);

  try {
    // Wallet check
    const wallet = await prisma.user_Wallet.findFirst({
      where: {
        currency_id: currencyId,
        user_id: userId,
      },
      select: {
        wallet_id: true,
      },
    });

    if (!wallet) {
      res.status(404).json({
        error: "Wallet not found",
      });

      return;
    }

    // Delete user
    await prisma.user_Wallet.delete({
      where: {
        wallet_id: wallet.wallet_id,
      },
    });

    res.status(200).json({
      message: "Wallet has been deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to delete the wallet",
    });
  }
};
