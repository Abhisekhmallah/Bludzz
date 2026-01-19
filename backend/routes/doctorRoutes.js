import express from "express"
import upload from "../middleware/multer.js"
import authDoctor from "../middleware/authDoctor.js"

import {
  loginDoctor,
  appointmentsDoctor,
  appointmentCancel,
  doctorList,
  changeAvailablity,
  appointmentComplete,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
  registerDoctor,
} from "../controllers/doctorController.js"

const doctorRouter = express.Router()

console.log("doctorRoutes.js loaded")

/* =========================
   AUTH
========================= */

doctorRouter.post("/login", loginDoctor)

doctorRouter.post(
  "/register-doctor",
  upload.single("document"),   // 🔥 FILE UPLOAD ENABLED
  registerDoctor
)

/* =========================
   DOCTOR PANEL (Protected)
========================= */

doctorRouter.post("/appointments", authDoctor, appointmentsDoctor)
doctorRouter.post("/cancel-appointment", authDoctor, appointmentCancel)
doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete)
doctorRouter.post("/dashboard", authDoctor, doctorDashboard)
doctorRouter.post("/profile", authDoctor, doctorProfile)
doctorRouter.post("/update-profile", authDoctor, updateDoctorProfile)
doctorRouter.post("/change-availability", authDoctor, changeAvailablity)

/* =========================
   PUBLIC
========================= */

doctorRouter.get("/list", doctorList)

export default doctorRouter
