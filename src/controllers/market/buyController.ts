import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

// Get all buy orders
export const getBuyOrders = async (req: Request, res: Response) => {
  try {
    const rawBuyOrders = await prisma.buy_Order.findMany({
      select: {
        buy_id: true,
        buyer_fiat_wallet_id: true,
        buyer_crypto_wallet_id: true,
        sell_id: true,
        price: true,
        amount: true,
        bought_at: true,
        buyer_fiat_wallet: {
          select: {
            user_id: true,
            currency: {
              select: { currency_code: true, currency_name: true },
            },
          },
        },
        buyer_crypto_wallet: {
          select: {
            currency: {
              select: { currency_code: true, currency_name: true },
            },
          },
        },
      },
    });

    // Remove nested object
    const buyOrders = rawBuyOrders.map(
      ({ buyer_fiat_wallet, buyer_crypto_wallet, price, amount, ...rest }) => ({
        ...rest,
        price: price.toNumber(),
        amount: amount.toNumber(),
        total_price: new Decimal(price).times(amount).toNumber(),
        buyer_id: buyer_fiat_wallet.user_id,
        fiat_currency_code: buyer_fiat_wallet.currency.currency_code,
        fiat_currency_name: buyer_fiat_wallet.currency.currency_name,
        crypto_currency_code: buyer_crypto_wallet.currency.currency_code,
        crypto_currency_name: buyer_crypto_wallet.currency.currency_name,
      })
    );

    res.status(200).json({
      data: buyOrders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to fetch buy orders",
    });
  }
};

// Get buy order by ID
export const getBuyOrderById = async (req: Request, res: Response) => {
  const buyId = Number(req.params.id);

  try {
    const rawBuyOrder = await prisma.buy_Order.findUnique({
      where: { buy_id: buyId },
      select: {
        buy_id: true,
        buyer_fiat_wallet_id: true,
        buyer_crypto_wallet_id: true,
        sell_id: true,
        price: true,
        amount: true,
        bought_at: true,
        buyer_fiat_wallet: {
          select: {
            user_id: true,
            currency: {
              select: { currency_code: true, currency_name: true },
            },
          },
        },
        buyer_crypto_wallet: {
          select: {
            currency: {
              select: { currency_code: true, currency_name: true },
            },
          },
        },
      },
    });

    if (!rawBuyOrder) {
      res.status(404).json({
        error: "Buy order not found",
      });

      return;
    }

    // Add total price
    const totalPrice = new Decimal(rawBuyOrder.price)
      .times(rawBuyOrder.amount)
      .toNumber();

    // Remove nested object
    const { buyer_fiat_wallet, buyer_crypto_wallet, ...buyOrder } = {
      ...rawBuyOrder,
      price: rawBuyOrder.price.toNumber(),
      amount: rawBuyOrder.amount.toNumber(),
      total_price: totalPrice,
      buyer_id: rawBuyOrder.buyer_fiat_wallet.user_id,
      fiat_currency_code: rawBuyOrder.buyer_fiat_wallet.currency.currency_code,
      fiat_currency_name: rawBuyOrder.buyer_fiat_wallet.currency.currency_name,
      crypto_currency_code:
        rawBuyOrder.buyer_crypto_wallet.currency.currency_code,
      crypto_currency_name:
        rawBuyOrder.buyer_crypto_wallet.currency.currency_name,
    };

    res.status(200).json({
      data: buyOrder,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to fetch buy order",
    });
  }
};

// Create a new buy order
export const createBuyOrder = async (req: Request, res: Response) => {
  const { user_id, sell_id, amount } = req.body;

  try {
    // Get seller wallet
    const sellOrder = await prisma.sell_List.findUnique({
      where: { sell_id },
      select: {
        amount: true,
        price: true,
        seller_fiat_wallet: {
          select: {
            wallet_id: true,
            user_id: true,
            balance: true,
            currency_id: true,
          },
        },
        seller_crypto_wallet: {
          select: { wallet_id: true, currency_id: true },
        },
      },
    });

    if (
      !sellOrder ||
      !sellOrder.seller_fiat_wallet ||
      !sellOrder.seller_crypto_wallet
    ) {
      res.status(404).json({ error: "Sell order not found" });

      return;
    }

    const sellerId = sellOrder.seller_fiat_wallet.user_id;

    // Check if buyer id is the same as seller id
    if (sellerId === user_id) {
      res.status(400).json({ error: "You cannot buy from yourself" });

      return;
    }

    // Check if sell order has enough crypto
    if (sellOrder.amount.lessThan(new Decimal(amount))) {
      res.status(400).json({ error: "Not enough crypto in the sell order" });

      return;
    }

    // Check buyer fiat wallet
    const buyerFiatWallet = await prisma.user_Wallet.findFirst({
      where: { user_id, currency_id: sellOrder.seller_fiat_wallet.currency_id },
      select: { wallet_id: true, balance: true },
    });

    if (!buyerFiatWallet) {
      res.status(404).json({ error: "Buyer fiat wallet not found" });

      return;
    }

    // Check buyer fiat balance
    const totalCost = sellOrder.price.times(new Decimal(amount));

    if (buyerFiatWallet.balance.lessThan(totalCost)) {
      res.status(400).json({ error: "Insufficient fiat balance" });

      return;
    }

    // Create a new crypto wallet if not exist
    let buyerCryptoWallet = await prisma.user_Wallet.findFirst({
      where: {
        user_id,
        currency_id: sellOrder.seller_crypto_wallet.currency_id,
      },
      select: { wallet_id: true, balance: true },
    });

    if (!buyerCryptoWallet) {
      buyerCryptoWallet = await prisma.user_Wallet.create({
        data: {
          user_id,
          currency_id: sellOrder.seller_crypto_wallet.currency_id,
          balance: new Decimal(0),
        },
        select: { wallet_id: true, balance: true },
      });
    }

    // Deduct sell order crypto
    await prisma.sell_List.update({
      where: { sell_id },
      data: { amount: sellOrder.amount.minus(new Decimal(amount)) },
    });

    // Deduct buyer fiat
    await prisma.user_Wallet.update({
      where: { wallet_id: buyerFiatWallet.wallet_id },
      data: { balance: buyerFiatWallet.balance.minus(totalCost) },
    });

    // Add buyer crypto
    await prisma.user_Wallet.update({
      where: { wallet_id: buyerCryptoWallet.wallet_id },
      data: { balance: buyerCryptoWallet.balance.plus(new Decimal(amount)) },
    });

    // Add seller fiat
    await prisma.user_Wallet.update({
      where: { wallet_id: sellOrder.seller_fiat_wallet.wallet_id },
      data: {
        balance: sellOrder.seller_fiat_wallet.balance.plus(totalCost),
      },
    });

    // Create buy order
    await prisma.buy_Order.create({
      data: {
        buyer_fiat_wallet_id: buyerFiatWallet.wallet_id,
        buyer_crypto_wallet_id: buyerCryptoWallet.wallet_id,
        sell_id,
        price: sellOrder.price,
        amount,
      },
    });

    res.status(200).json({
      message: "Create buy order successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to create buy order",
    });
  }
};
