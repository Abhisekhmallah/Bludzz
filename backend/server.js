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
// CORS CONFIG (FIXED)
// =========================
const allowedOrigins = [
  "http://localhost:5173",
  "https://bludzz.vercel.app",
  "https://bludzz-n5d8con2o-abhishek-mallah-s-projects.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server, Postman, Render health checks
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

// 🔴 REQUIRED FOR PREFLIGHT
app.options("*", cors());


// =========================
// MIDDLEWARES
// =========================
app.use(express.json());

// =========================
// STATIC FILES
// =========================
app.use("/uploads", express.static("uploads"));

// =========================
// API ROUTES
// =========================
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRoutes);
app.use("/api", labRoute);
app.use("/api/prescriptions", prescriptionRoutes);

// =========================
// ROOT HEALTH CHECK
// =========================
app.get("/", (req, res) => {
  res.send("API Working");
});

// =========================
// 404 HANDLER
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
