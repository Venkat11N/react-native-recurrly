import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import insightsRoutes from "./routes/insights.js";
import subscriptionRoutes from "./routes/subscriptions.js";
import userRoutes from "./routes/users.js";

dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Clerk authentication middleware (temporarily disabled due to error)
// app.use(
//   clerkMiddleware({
//     publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
//     secretKey: process.env.CLERK_SECRET_KEY,
//   }),
// );

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Recurrly API is running" });
});

// API Routes
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/users", userRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
