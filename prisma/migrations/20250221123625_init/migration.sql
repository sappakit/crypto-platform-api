-- CreateEnum
CREATE TYPE "CurrencyType" AS ENUM ('CRYPTO', 'FIAT');

-- CreateEnum
CREATE TYPE "SellStatus" AS ENUM ('OPEN', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CryptoTransactionType" AS ENUM ('INTERNAL', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "FiatTransactionType" AS ENUM ('DEPOSIT', 'WITHDRAW');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'CREDIT_CARD');

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" TEXT NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "User_Wallet" (
    "wallet_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "currency_id" INTEGER NOT NULL,
    "balance" DECIMAL(18,8) NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_Wallet_pkey" PRIMARY KEY ("wallet_id")
);

-- CreateTable
CREATE TABLE "Currency" (
    "currency_id" SERIAL NOT NULL,
    "currency_type" "CurrencyType" NOT NULL,
    "currency_code" VARCHAR(10) NOT NULL,
    "currency_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("currency_id")
);

-- CreateTable
CREATE TABLE "Sell_List" (
    "sell_id" SERIAL NOT NULL,
    "seller_fiat_wallet_id" INTEGER NOT NULL,
    "seller_crypto_wallet_id" INTEGER NOT NULL,
    "price" DECIMAL(18,2) NOT NULL,
    "amount" DECIMAL(18,8) NOT NULL,
    "status" "SellStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sell_List_pkey" PRIMARY KEY ("sell_id")
);

-- CreateTable
CREATE TABLE "Buy_Order" (
    "buy_id" SERIAL NOT NULL,
    "buyer_fiat_wallet_id" INTEGER NOT NULL,
    "buyer_crypto_wallet_id" INTEGER NOT NULL,
    "sell_id" INTEGER NOT NULL,
    "price" DECIMAL(18,2) NOT NULL,
    "amount" DECIMAL(18,8) NOT NULL,
    "bought_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Buy_Order_pkey" PRIMARY KEY ("buy_id")
);

-- CreateTable
CREATE TABLE "Crypto_Transaction" (
    "crypto_transaction_id" SERIAL NOT NULL,
    "sender_wallet_id" INTEGER NOT NULL,
    "receiver_wallet_id" INTEGER,
    "amount" DECIMAL(18,8) NOT NULL,
    "transaction_type" "CryptoTransactionType" NOT NULL,
    "external_address" VARCHAR(255),
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Crypto_Transaction_pkey" PRIMARY KEY ("crypto_transaction_id")
);

-- CreateTable
CREATE TABLE "Fiat_Transaction" (
    "fiat_transaction_id" SERIAL NOT NULL,
    "wallet_id" INTEGER NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "transaction_type" "FiatTransactionType" NOT NULL,
    "payment_method" "PaymentMethod",
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fiat_Transaction_pkey" PRIMARY KEY ("fiat_transaction_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_currency_code_key" ON "Currency"("currency_code");

-- AddForeignKey
ALTER TABLE "User_Wallet" ADD CONSTRAINT "User_Wallet_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Wallet" ADD CONSTRAINT "User_Wallet_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "Currency"("currency_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sell_List" ADD CONSTRAINT "Sell_List_seller_fiat_wallet_id_fkey" FOREIGN KEY ("seller_fiat_wallet_id") REFERENCES "User_Wallet"("wallet_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sell_List" ADD CONSTRAINT "Sell_List_seller_crypto_wallet_id_fkey" FOREIGN KEY ("seller_crypto_wallet_id") REFERENCES "User_Wallet"("wallet_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Buy_Order" ADD CONSTRAINT "Buy_Order_buyer_fiat_wallet_id_fkey" FOREIGN KEY ("buyer_fiat_wallet_id") REFERENCES "User_Wallet"("wallet_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Buy_Order" ADD CONSTRAINT "Buy_Order_buyer_crypto_wallet_id_fkey" FOREIGN KEY ("buyer_crypto_wallet_id") REFERENCES "User_Wallet"("wallet_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Buy_Order" ADD CONSTRAINT "Buy_Order_sell_id_fkey" FOREIGN KEY ("sell_id") REFERENCES "Sell_List"("sell_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Crypto_Transaction" ADD CONSTRAINT "Crypto_Transaction_sender_wallet_id_fkey" FOREIGN KEY ("sender_wallet_id") REFERENCES "User_Wallet"("wallet_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Crypto_Transaction" ADD CONSTRAINT "Crypto_Transaction_receiver_wallet_id_fkey" FOREIGN KEY ("receiver_wallet_id") REFERENCES "User_Wallet"("wallet_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fiat_Transaction" ADD CONSTRAINT "Fiat_Transaction_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "User_Wallet"("wallet_id") ON DELETE CASCADE ON UPDATE CASCADE;
