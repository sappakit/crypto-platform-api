import express from "express";
import dotenv from "dotenv";
import userRouter from "./routes/userRoutes";
import currencyRouter from "./routes/currencyRoutes";
import marketRouter from "./routes/marketRoutes";
import transactionRouter from "./routes/transactionRoutes";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

// All routes
app.use("/users", userRouter); // User routes
app.use("/currencies", currencyRouter); // Currency routes
app.use("/market", marketRouter); // Market routes
app.use("/transaction", transactionRouter); // Transaction routes

app.get("/test", (req, res) => {
  res.json("API Test");
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
