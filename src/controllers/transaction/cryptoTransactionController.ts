import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

// Get all crypto transactions
export const getCryptoTransaction = async (req: Request, res: Response) => {
  try {
    const rawCryptoTransactions = await prisma.crypto_Transaction.findMany({
      select: {
        crypto_transaction_id: true,
        sender_wallet_id: true,
        receiver_wallet_id: true,
        amount: true,
        transaction_type: true,
        external_address: true,
        status: true,
        created_at: true,
        updated_at: true,
        sender_wallet: {
          select: {
            user_id: true,
          },
        },
        receiver_wallet: {
          select: {
            user_id: true,
            currency: { select: { currency_code: true, currency_name: true } },
          },
        },
      },
    });

    // Remove nested objects
    const cryptoTransactions = rawCryptoTransactions.map(
      ({ sender_wallet, receiver_wallet, amount, ...rest }) => ({
        ...rest,
        sender_id: sender_wallet.user_id,
        receiver_id: receiver_wallet?.user_id || null,
        amount: amount.toNumber(),
        receiver_currency_code: receiver_wallet?.currency.currency_code,
        receiver_currency_name: receiver_wallet?.currency.currency_name,
      })
    );

    res.status(200).json({
      data: cryptoTransactions,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to fetch crypto transactions",
    });
  }
};

export const getCryptoTransactionById = async (req: Request, res: Response) => {
  const transactionId = Number(req.params.id);

  try {
    const rawCryptoTransaction = await prisma.crypto_Transaction.findUnique({
      where: { crypto_transaction_id: transactionId },
      select: {
        crypto_transaction_id: true,
        sender_wallet_id: true,
        receiver_wallet_id: true,
        amount: true,
        transaction_type: true,
        external_address: true,
        status: true,
        created_at: true,
        updated_at: true,
        sender_wallet: {
          select: {
            user_id: true,
          },
        },
        receiver_wallet: {
          select: {
            user_id: true,
            currency: { select: { currency_code: true, currency_name: true } },
          },
        },
      },
    });

    // If transaction not found
    if (!rawCryptoTransaction) {
      res.status(404).json({ error: "Crypto transaction not found" });

      return;
    }

    // Remove nested objects
    const { sender_wallet, receiver_wallet, ...cryptoTransaction } = {
      ...rawCryptoTransaction,
      sender_id: rawCryptoTransaction.sender_wallet.user_id,
      receiver_id: rawCryptoTransaction.receiver_wallet?.user_id || null,
      amount: rawCryptoTransaction.amount.toNumber(),
      receiver_currency_code:
        rawCryptoTransaction.receiver_wallet?.currency.currency_code,
      receiver_currency_name:
        rawCryptoTransaction.receiver_wallet?.currency.currency_name,
    };

    res.status(200).json({ data: cryptoTransaction });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch crypto transaction" });
  }
};

// Create a new crypto transactions
export const createCryptoTransaction = async (req: Request, res: Response) => {
  const {
    sender_wallet_id,
    receiver_wallet_id,
    amount,
    transaction_type,
    external_address,
  } = req.body;

  try {
    // Check sender wallet
    const senderWallet = await prisma.user_Wallet.findUnique({
      where: { wallet_id: sender_wallet_id },
      select: { balance: true, currency_id: true },
    });

    if (!senderWallet) {
      res.status(404).json({ error: "Sender wallet not found" });

      return;
    }

    // Check if sender has enough balance
    const transactionAmount = new Decimal(amount);

    if (senderWallet.balance.lessThan(transactionAmount)) {
      res.status(400).json({ error: "Insufficient balance." });

      return;
    }

    // If INTERNAL transaction, add to receiver's wallet
    if (transaction_type === "INTERNAL") {
      // Check receiver wallet
      const receiverWallet = await prisma.user_Wallet.findUnique({
        where: { wallet_id: receiver_wallet_id },
        select: { balance: true, currency_id: true },
      });

      if (!receiverWallet) {
        res.status(404).json({ error: "Receiver wallet not found" });

        return;
      }

      // Check if the two wallets hold the same currency
      if (senderWallet.currency_id !== receiverWallet.currency_id) {
        res.status(400).json({
          error: "Sender and receiver wallets must hold the same currency",
        });

        return;
      }

      // Deduct sender crypto wallet
      await prisma.user_Wallet.update({
        where: { wallet_id: sender_wallet_id },
        data: { balance: senderWallet.balance.minus(transactionAmount) },
      });

      // Add receiver crypto
      await prisma.user_Wallet.update({
        where: { wallet_id: receiver_wallet_id },
        data: { balance: receiverWallet.balance.plus(transactionAmount) },
      });
    } else if (transaction_type === "EXTERNAL") {
      // If EXTERNAL transaction only deduct sender wallet

      await prisma.user_Wallet.update({
        where: { wallet_id: sender_wallet_id },
        data: { balance: senderWallet.balance.minus(transactionAmount) },
      });
    }

    // Create transaction
    await prisma.crypto_Transaction.create({
      data: {
        sender_wallet_id,
        receiver_wallet_id,
        amount: transactionAmount,
        transaction_type,
        external_address,
        status: "COMPLETED",
      },
    });

    res.status(200).json({
      message: "Create crypto transaction successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to create crypto transaction",
    });
  }
};
