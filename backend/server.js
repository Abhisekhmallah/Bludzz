import express from "express";
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
   🔴 HARD CORS FIX (RENDER SAFE)
========================= */
const allowedOrigins = [
  "http://localhost:5173",
  "https://bludzz.vercel.app",
  "https://bludzz-n5d8con2o-abhishek-mallah-s-projects.vercel.app"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  // 🔥 THIS IS THE KEY
  if (req.method === "OPTIONS") {
    return res.status(200).end();
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
   START SERVER
========================= */
app.listen(port, () => {
  console.log(`🚀 Server running on PORT ${port}`);
});
