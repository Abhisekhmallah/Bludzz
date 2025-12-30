import express from "express";
import cors from "cors";
import "dotenv/config";

import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";

import userRouter from "./routes/userRoute.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import adminRouter from "./routes/adminRoute.js";
import labRoute from "./routes/labRoute.js";
import prescriptionRoutes from "./routes/prescriptionRoute.js"; // ✅ ADDED
import otpRoute from "./routes/otpRoute.js";
// =========================
// APP SETUP
// =========================
const app = express();
const port = process.env.PORT || 4000;

// =========================
// DATABASE & SERVICES
// =========================
connectDB();
connectCloudinary();

// =========================
// MIDDLEWARES
// =========================
app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true
  })
);

// =========================
// STATIC FILES (PRESCRIPTIONS)
// =========================
app.use("/uploads", express.static("uploads")); // ✅ ADDED

// =========================
// API ROUTES
// =========================
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRoutes);
app.use("/api", labRoute);
app.use("/api/prescriptions", prescriptionRoutes); // ✅ ADDED
app.use("/api/otp", otpRoute);
// =========================
// ROOT HEALTH CHECK
// =========================
app.get("/", (req, res) => {
  res.send("API Working");
});

// =========================
// 404 HANDLER (ALWAYS LAST)
// =========================
app.use("*", (req, res) => {
  console.log("❌ Unknown route hit:", req.method, req.originalUrl);
  res.status(404).json({ success: false, message: "Route not found" });
});

// =========================
// START SERVER
// =========================
app.listen(port, () => {
  console.log(`🚀 Server started on PORT: ${port}`);
});
