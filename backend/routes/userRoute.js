import express from "express"
import upload from "../middleware/multer.js"
import authUser from "../middleware/authUser.js"

import {
  sendOTP,
  verifyOTP,
  resendOTP,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
} from "../controllers/userController.js"

const userRouter = express.Router()

// ---------------- OTP AUTH ----------------
userRouter.post("/send-otp", sendOTP)
userRouter.post("/verify-otp", verifyOTP)
userRouter.post("/resend-otp", resendOTP)

// ---------------- PROFILE ----------------
userRouter.get("/get-profile", authUser, getProfile)
userRouter.post(
  "/update-profile",
  authUser,
  upload.single("image"),
  updateProfile
)

// ---------------- APPOINTMENTS ----------------
userRouter.post("/book-appointment", authUser, bookAppointment)
userRouter.get("/appointments", authUser, listAppointment)
userRouter.post("/cancel-appointment", authUser, cancelAppointment)

export default userRouter
