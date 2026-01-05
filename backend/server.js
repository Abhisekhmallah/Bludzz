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
const port = process.env.PORT || 10000;

/* =========================
   DATABASE & SERVICES
========================= */
connectDB();
connectCloudinary();

/* =========================
   CORS (CRITICAL FIX)
========================= */
const allowedOrigins = [
  "http://localhost:5173",
  "https://bludzz-n5d8con2o-abhishek-mallah-s-projects.vercel.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server, Postman, Render health checks
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ Blocked by CORS:", origin);
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// 🚨 THIS IS NON-NEGOTIABLE
app.options("*", cors());

/* =========================
   MIDDLEWARES
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
   404
========================= */
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

/* =========================
   START SERVER
========================= */
app.listen(port, () => {
  console.log(`🚀 Server running on PORT ${port}`);
});
