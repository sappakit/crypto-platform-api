# Crypto Platform API

This is a **Node.js + Express + Prisma + PostgreSQL** backend for a cryptocurrency exchange platform.  
It allows users to **buy, sell, and transfer cryptocurrencies** using fiat (THB, USD) and crypto wallets.

## Features

- **User management**: Create, update, delete users
- **Wallet management**: Fiat & crypto wallets per user
- **Buy & sell orders**: Place, manage, and track transactions
- **Transaction history**: Crypto transfers (internal & external), and fiat deposits/withdrawals
- **Seed database**: Preloaded with mock data for testing
- **Currency management**: Add, update, remove fiat and cryptocurrency types

---

## Technologies Used

- **Node.js**
- **Express.js**
- **Prisma ORM**
- **PostgreSQL**
- **TypeScript**

---

## Installation & Setup

### **1. Clone the Repository**

```sh
git clone https://github.com/sappakit/crypto-platform-api.git
cd crypto-platform-api
```

### **2. Install Dependencies**

```sh
npm install
```

### **3. Set Up Environment Variables**

- Create a `.env` file in the root directory
- Add the following:
  ```
  DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE"
  ```
- Replace `USER`, `PASSWORD` and `DATABASE` with your PostgreSQL credentials.

### **4. Run Database Migrations**

```sh
npx prisma migrate dev --name init
```

### **5. Seed the Database (Optional)**

```sh
npx prisma db seed
```

### **6. Start the Development Server**

```sh
npm run dev
```

### **7. For Production, Build & Start**

```sh
npm run build
npm start
```

---

## API Endpoints

A full list of API endpoints can be found in the API documentation:

📄 **[API Documentation (Google Sheets)](https://docs.google.com/spreadsheets/d/1c9QjzbP48CwDzr9hANNkHHi73swbHV_T60fjH0q8WmA/edit?usp=sharing)**

---

## Testing the API

You can test the API using **Postman**, **Insomnia**, or via `cURL` commands.

---

## Resetting the Database

**This will erase all data and reset migrations!**

```sh
npx prisma migrate reset --force
```
