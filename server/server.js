import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import connectDB from "./src/config/db.js";
import { errorHandler } from "./src/middleware/errorMiddleware.js";
import authRoutes from "./src/routes/authRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import reportRoutes from "./src/routes/reportRoutes.js";
import queryRoutes from "./src/routes/queryRoutes.js";
import chartRoutes from "./src/routes/chartRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import optionRoutes from "./src/routes/optionRoutes.js";
import aiRoutes from "./src/routes/aiRoutes.js";
import { startScheduler } from "./src/services/schedulerService.js";

dotenv.config();
connectDB();

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  process.env.CLIENT_URL
].filter(Boolean);

app.use(helmet());
app.use(morgan("combined"));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (!allowedOrigins.includes(origin)) {
        return callback(new Error("Not allowed by CORS"), false);
      }
      return callback(null, true);
    },
    credentials: true
  })
);

app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000
});
app.use(limiter);

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/queries", queryRoutes);
app.use("/api/charts", chartRoutes);
app.use("/api/users", userRoutes);
app.use("/api/options", optionRoutes);
app.use("/api/ai", aiRoutes);

startScheduler();
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
