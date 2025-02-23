import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

// Get all fiat transactions
export const getFiatTransaction = async (req: Request, res: Response) => {
  try {
    const rawFiatTransactions = await prisma.fiat_Transaction.findMany({
      select: {
        fiat_transaction_id: true,
        wallet_id: true,
        amount: true,
        transaction_type: true,
        payment_method: true,
        status: true,
        created_at: true,
        updated_at: true,
        wallet: {
          select: {
            user_id: true,
            currency: {
              select: { currency_code: true, currency_name: true },
            },
          },
        },
      },
    });

    // Remove nested objects
    const fiatTransactions = rawFiatTransactions.map(
      ({ wallet, amount, ...rest }) => ({
        ...rest,
        user_id: wallet.user_id,
        amount: amount.toNumber(),
        currency_code: wallet.currency.currency_code,
        currency_name: wallet.currency.currency_name,
      })
    );

    res.status(200).json({
      data: fiatTransactions,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to fetch fiat transactions",
    });
  }
};

// Get fiat transaction By Id
export const getFiatTransactionById = async (req: Request, res: Response) => {
  const transactionId = Number(req.params.id);

  try {
    const rawFiatTransaction = await prisma.fiat_Transaction.findUnique({
      where: { fiat_transaction_id: transactionId },
      select: {
        fiat_transaction_id: true,
        wallet_id: true,
        amount: true,
        transaction_type: true,
        payment_method: true,
        status: true,
        created_at: true,
        updated_at: true,
        wallet: {
          select: {
            user_id: true,
            currency: {
              select: { currency_code: true, currency_name: true },
            },
          },
        },
      },
    });

    if (!rawFiatTransaction) {
      res.status(404).json({ error: "Fiat transaction not found" });
      return;
    }

    // Remove nested objects
    const { wallet, ...fiatTransaction } = {
      ...rawFiatTransaction,
      user_id: rawFiatTransaction.wallet.user_id,
      amount: rawFiatTransaction.amount.toNumber(),
      currency_code: rawFiatTransaction.wallet.currency.currency_code,
      currency_name: rawFiatTransaction.wallet.currency.currency_name,
    };

    res.status(200).json({
      data: fiatTransaction,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch fiat transaction" });
  }
};

// Create a new withdraw transactions
export const createFiatTransaction = async (req: Request, res: Response) => {
  const { wallet_id, amount, transaction_type, payment_method } = req.body;

  try {
    // Check user wallet
    const wallet = await prisma.user_Wallet.findUnique({
      where: { wallet_id },
      select: {
        balance: true,
        currency: {
          select: { currency_type: true },
        },
      },
    });

    if (!wallet) {
      res.status(404).json({ error: "Wallet not found" });

      return;
    }

    const transactionAmount = new Decimal(amount);

    // If WITHDRAW transaction, deduct user fiat wallet balance
    if (transaction_type === "WITHDRAW") {
      // Check if currency type is FIAT
      if (wallet.currency.currency_type !== "FIAT") {
        res.status(400).json({
          error: "Only wallets holding fiat currency are allowed",
        });

        return;
      }

      // Check if user has enough balance
      if (wallet.balance.lessThan(transactionAmount)) {
        res.status(400).json({ error: "Insufficient balance" });

        return;
      }

      // Deduct user fiat balance
      await prisma.user_Wallet.update({
        where: { wallet_id },
        data: { balance: wallet.balance.minus(transactionAmount) },
      });

      // Create a new withdraw transaction
      await prisma.fiat_Transaction.create({
        data: {
          wallet_id,
          amount: transactionAmount,
          transaction_type,
          status: "COMPLETED",
        },
      });
    } else if (transaction_type === "DEPOSIT") {
      // If DEPOSIT transaction, add user fiat wallet balance

      // Check if currency type is FIAT
      if (wallet.currency.currency_type !== "CRYPTO") {
        res.status(400).json({
          error: "Only wallets holding cryptocurrency are allowed",
        });

        return;
      }

      await prisma.user_Wallet.update({
        where: { wallet_id },
        data: { balance: wallet.balance.plus(transactionAmount) },
      });

      // Create a new deposite transaction
      await prisma.fiat_Transaction.create({
        data: {
          wallet_id,
          amount: transactionAmount,
          transaction_type,
          payment_method,
          status: "COMPLETED",
        },
      });
    }

    res.status(200).json({
      message: "Create fiat transaction successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to create fiat transaction",
    });
  }
};
