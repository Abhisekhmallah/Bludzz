import express from "express"
import cors from "cors"
import "dotenv/config"

import connectDB from "./config/mongodb.js"
import connectCloudinary from "./config/cloudinary.js"

import userRouter from "./routes/userRoute.js"
import doctorRoutes from "./routes/doctorRoutes.js"
import adminRouter from "./routes/adminRoute.js"
import labRoute from "./routes/labRoute.js"
import prescriptionRoutes from "./routes/prescriptionRoute.js"

const app = express()
const PORT = process.env.PORT || 10000

/* =========================
   DATABASE & SERVICES
========================= */
const startServices = async () => {
  try {
    await connectDB()
    connectCloudinary()
    console.log("✅ Services initialized")
  } catch (err) {
    console.error("❌ Failed to initialize services:", err.message)
    process.exit(1)
  }
}

/* =========================
   CORS CONFIG (PRODUCTION SAFE)
========================= */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://bludzz.vercel.app",
      "https://bludzz-1.onrender.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
)

// Required for preflight
app.options("*", cors())

/* =========================
   MIDDLEWARES
========================= */
app.use(express.json())

/* =========================
   STATIC FILES
========================= */
app.use("/uploads", express.static("uploads"))

/* =========================
   ROUTES
========================= */
app.use("/api/user", userRouter)
app.use("/api/admin", adminRouter)
app.use("/api/doctor", doctorRoutes)
app.use("/api", labRoute)
app.use("/api/prescriptions", prescriptionRoutes)

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("API Working")
})

/* =========================
   404 HANDLER
========================= */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  })
})

/* =========================
   START SERVER (SAFE)
========================= */
const startServer = async () => {
  await startServices()

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on PORT ${PORT}`)
  })

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`❌ Port ${PORT} is already in use`)
      console.error("➡️ Stop the running process or change PORT")
      process.exit(1)
    } else {
      console.error("❌ Server error:", err)
      process.exit(1)
    }
  })
}

startServer()
