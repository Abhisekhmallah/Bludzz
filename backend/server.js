import cors from "cors"
import express from "express"
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
   CORS CONFIG (FIXED)
========================= */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",

  "https://bludzz.vercel.app",
  "https://bludzz-1.onrender.com",
  "https://bludz.com",
  "https://www.bludz.com",
  "https://bludz-adminpanel.vercel.app",
]

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow Postman / server-to-server requests (no origin)
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      } else {
        console.log("❌ Blocked by CORS:", origin)
        return callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

    // IMPORTANT: Add token header support
    allowedHeaders: ["Content-Type", "Authorization", "token"],
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
   ERROR HANDLER (IMPORTANT)
========================= */
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS blocked: Origin not allowed",
    })
  }

  console.error("❌ Server error:", err)
  res.status(500).json({
    success: false,
    message: "Internal server error",
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
