import express from "express";
import dotenv from "dotenv";
import userRouter from "./routes/userRoutes";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

// All routes
app.use("/users", userRouter);

app.get("/test", (req, res) => {
  res.json("API Test");
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
