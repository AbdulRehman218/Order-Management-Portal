import express from "express";
import dotenv from "dotenv";
import cors from "cors";
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

/* ======================
   CORS / MIDDLEWARE
====================== */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  process.env.CLIENT_URL // Production URL
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true
  })
);

app.use(express.json());

/* ======================
   ROUTES
====================== */
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/queries", queryRoutes);
app.use("/api/charts", chartRoutes);
app.use("/api/users", userRoutes);
app.use("/api/options", optionRoutes);
app.use("/api/ai", aiRoutes);

/* ======================
   SCHEDULER
====================== */
startScheduler();

/* ======================
   ERROR HANDLER
====================== */
app.use(errorHandler);

/* ======================
   SERVER
====================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () =>
  console.log(`Server running on port ${PORT}`)
);
