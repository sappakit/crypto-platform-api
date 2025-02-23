import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

// Get all sell orders
export const getSellOrders = async (req: Request, res: Response) => {
  try {
    const rawSellOrders = await prisma.sell_List.findMany({
      select: {
        sell_id: true,
        seller_fiat_wallet_id: true,
        seller_crypto_wallet_id: true,
        price: true,
        amount: true,
        status: true,
        created_at: true,
        updated_at: true,
        seller_fiat_wallet: {
          select: {
            user_id: true,
            currency: {
              select: { currency_code: true, currency_name: true },
            },
          },
        },
        seller_crypto_wallet: {
          select: {
            currency: {
              select: { currency_code: true, currency_name: true },
            },
          },
        },
      },
    });

    // Remove nested object
    const sellOrders = rawSellOrders.map(
      ({
        seller_fiat_wallet,
        seller_crypto_wallet,
        price,
        amount,
        ...rest
      }) => ({
        ...rest,
        price: price.toNumber(),
        amount: amount.toNumber(),
        seller_id: seller_fiat_wallet.user_id,
        fiat_currency_code: seller_fiat_wallet.currency.currency_code,
        fiat_currency_name: seller_fiat_wallet.currency.currency_name,
        crypto_currency_code: seller_crypto_wallet.currency.currency_code,
        crypto_currency_name: seller_crypto_wallet.currency.currency_name,
      })
    );

    res.status(200).json({
      data: sellOrders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to fetch sell orders",
    });
  }
};

// Get sell order by ID
export const getSellOrderById = async (req: Request, res: Response) => {
  const sellId = Number(req.params.id);

  try {
    const rawSellOrder = await prisma.sell_List.findUnique({
      where: { sell_id: sellId },
      select: {
        sell_id: true,
        seller_fiat_wallet_id: true,
        seller_crypto_wallet_id: true,
        price: true,
        amount: true,
        status: true,
        created_at: true,
        updated_at: true,
        seller_fiat_wallet: {
          select: {
            user_id: true,
            currency: {
              select: { currency_code: true, currency_name: true },
            },
          },
        },
        seller_crypto_wallet: {
          select: {
            currency: {
              select: { currency_code: true, currency_name: true },
            },
          },
        },
      },
    });

    if (!rawSellOrder) {
      res.status(404).json({
        error: "Sell order not found",
      });

      return;
    }

    // Remove nested object
    const { seller_fiat_wallet, seller_crypto_wallet, ...sellOrder } = {
      ...rawSellOrder,
      price: rawSellOrder.price.toNumber(),
      amount: rawSellOrder.amount.toNumber(),
      seller_id: rawSellOrder.seller_fiat_wallet.user_id,
      fiat_currency_code:
        rawSellOrder.seller_fiat_wallet.currency.currency_code,
      fiat_currency_name:
        rawSellOrder.seller_fiat_wallet.currency.currency_name,
      crypto_currency_code:
        rawSellOrder.seller_crypto_wallet.currency.currency_code,
      crypto_currency_name:
        rawSellOrder.seller_crypto_wallet.currency.currency_name,
    };

    res.status(200).json({
      data: sellOrder,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to fetch sell order",
    });
  }
};

// Create a new sell order
export const createSellOrder = async (req: Request, res: Response) => {
  const { user_id, fiat_currency_id, crypto_currency_id, price, amount } =
    req.body;

  try {
    // Check crypto wallet
    const cryptoWallet = await prisma.user_Wallet.findFirst({
      where: { user_id, currency_id: crypto_currency_id },
      select: { wallet_id: true, balance: true },
    });

    if (!cryptoWallet) {
      res.status(404).json({
        error: "Crypto wallet not found",
      });

      return;
    }

    // Check if sell order already exists
    const sellOrder = await prisma.sell_List.findFirst({
      where: { seller_crypto_wallet_id: cryptoWallet.wallet_id },
    });

    if (sellOrder) {
      res.status(400).json({
        error: "Sell order already exist",
      });

      return;
    }

    // Check crypto balance
    if (cryptoWallet.balance.lessThan(new Decimal(amount))) {
      res.status(400).json({ error: "Insufficient crypto balance" });

      return;
    }

    // Check fiat wallet
    let fiatWallet = await prisma.user_Wallet.findFirst({
      where: { user_id, currency_id: fiat_currency_id },
      select: { wallet_id: true },
    });

    // Create a new fiat wallet if not exist
    if (!fiatWallet) {
      fiatWallet = await prisma.user_Wallet.create({
        data: {
          user_id,
          currency_id: fiat_currency_id,
          balance: new Decimal(0),
        },
        select: { wallet_id: true },
      });
    }

    // Deduct crypto amount from seller crypto wallet
    await prisma.user_Wallet.update({
      data: { balance: cryptoWallet.balance.minus(new Decimal(amount)) },
      where: { wallet_id: cryptoWallet.wallet_id },
    });

    // Create sell order
    await prisma.sell_List.create({
      data: {
        seller_fiat_wallet_id: fiatWallet.wallet_id,
        seller_crypto_wallet_id: cryptoWallet.wallet_id,
        price,
        amount,
        status: "OPEN",
      },
    });

    res.status(200).json({
      message: "Create sell order successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to create sell order",
    });
  }
};
