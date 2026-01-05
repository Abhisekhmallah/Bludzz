import express from "express";
import cors from "cors";
import "dotenv/config";

import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";

import userRouter from "./routes/userRoute.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import adminRouter from "./routes/adminRoute.js";
import labRoute from "./routes/labRoute.js";
import prescriptionRoutes from "./routes/prescriptionRoute.js";

const app = express();
const port = process.env.PORT || 4000;

/* =========================
   CONNECT SERVICES
========================= */
connectDB();
connectCloudinary();

/* =========================
   CORS — MUST BE FIRST
========================= */
const allowedOrigins = [
  "http://localhost:5173",
  "https://bludzz.vercel.app",
  "https://bludzz-n5d8con2o-abhishek-mallah-s-projects.vercel.app"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  // 🔴 CRITICAL: handle preflight HERE
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

/* =========================
   BODY PARSER
========================= */
app.use(express.json());

/* =========================
   STATIC FILES
========================= */
app.use("/uploads", express.static("uploads"));

/* =========================
   ROUTES
========================= */
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRoutes);
app.use("/api", labRoute);
app.use("/api/prescriptions", prescriptionRoutes);

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("API Working");
});

/* =========================
   404 HANDLER
========================= */
app.use("*", (req, res) => {
  console.log("❌ Unknown route:", req.method, req.originalUrl);
  res.status(404).json({ success: false, message: "Route not found" });
});

/* =========================
   START SERVER
========================= */
app.listen(port, () => {
  console.log(`🚀 Server running on PORT ${port}`);
});
