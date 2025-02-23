import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Seed Users
  const user1 = await prisma.user.create({
    data: {
      username: "johndoe",
      password: "password123",
      email: "johndoe@gmail.com",
      name: "John Doe",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: "emily",
      password: "SecurePass456",
      email: "emily_wilson@yahoo.com",
      name: "Emily Wilson",
    },
  });

  // Seed Currencies (Fiat & Crypto)
  const usd = await prisma.currency.create({
    data: {
      currency_type: "FIAT",
      currency_code: "USD",
      currency_name: "US Dollar",
    },
  });

  const btc = await prisma.currency.create({
    data: {
      currency_type: "CRYPTO",
      currency_code: "BTC",
      currency_name: "Bitcoin",
    },
  });

  // Seed Wallets for Users
  const user1FiatWallet = await prisma.user_Wallet.create({
    data: {
      user_id: user1.user_id,
      currency_id: usd.currency_id,
      balance: new Decimal(1000),
    },
  });

  const user1CryptoWallet = await prisma.user_Wallet.create({
    data: {
      user_id: user1.user_id,
      currency_id: btc.currency_id,
      balance: new Decimal(2),
    },
  });

  const user2FiatWallet = await prisma.user_Wallet.create({
    data: {
      user_id: user2.user_id,
      currency_id: usd.currency_id,
      balance: new Decimal(500),
    },
  });

  const user2CryptoWallet = await prisma.user_Wallet.create({
    data: {
      user_id: user2.user_id,
      currency_id: btc.currency_id,
      balance: new Decimal(1),
    },
  });

  // Seed Sell Order
  const sellOrder = await prisma.sell_List.create({
    data: {
      seller_fiat_wallet_id: user1FiatWallet.wallet_id,
      seller_crypto_wallet_id: user1CryptoWallet.wallet_id,
      price: new Decimal(30000),
      amount: new Decimal(1),
      status: "OPEN",
    },
  });

  // Seed Buy Order
  await prisma.buy_Order.create({
    data: {
      buyer_fiat_wallet_id: user2FiatWallet.wallet_id,
      buyer_crypto_wallet_id: user2CryptoWallet.wallet_id,
      sell_id: sellOrder.sell_id,
      price: new Decimal(30000),
      amount: new Decimal(1),
      bought_at: new Date(),
    },
  });

  // Seed Crypto Transactions (Internal & External)
  await prisma.crypto_Transaction.createMany({
    data: [
      {
        sender_wallet_id: user1CryptoWallet.wallet_id,
        receiver_wallet_id: user2CryptoWallet.wallet_id,
        amount: new Decimal(0.5),
        transaction_type: "INTERNAL",
        status: "COMPLETED",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        sender_wallet_id: user2CryptoWallet.wallet_id,
        external_address: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf70u3",
        amount: new Decimal(0.1),
        transaction_type: "EXTERNAL",
        status: "COMPLETED",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
  });

  // Seed Fiat Transactions (Deposit & Withdraw)
  await prisma.fiat_Transaction.createMany({
    data: [
      {
        wallet_id: user1FiatWallet.wallet_id,
        amount: new Decimal(500),
        transaction_type: "DEPOSIT",
        payment_method: "BANK_TRANSFER",
        status: "COMPLETED",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        wallet_id: user2FiatWallet.wallet_id,
        amount: new Decimal(200),
        transaction_type: "WITHDRAW",
        payment_method: "CREDIT_CARD",
        status: "COMPLETED",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
  });

  console.log("Database seeding completed");
}

main()
  .catch((error) => console.error("Error seeding database:", error))
  .finally(() => prisma.$disconnect());
