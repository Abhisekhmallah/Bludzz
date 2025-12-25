import express from "express";
console.log("doctorRoutes.js loaded");
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
  registerDoctor
} from "../controllers/doctorController.js";

import authDoctor from "../middleware/authDoctor.js";

const doctorRouter = express.Router();

/* =========================
   AUTH
========================= */

doctorRouter.post("/login", loginDoctor);
doctorRouter.post(
  "/register-doctor",
  (req, res, next) => {
    console.log("🔥 POST /api/doctor/register-doctor HIT");
    next();
  },
  registerDoctor
); // ✅ self registration

/* =========================
   DOCTOR PANEL (Protected)
========================= */

// NOTE: Using POST because controllers expect req.body
doctorRouter.post("/appointments", authDoctor, appointmentsDoctor);
doctorRouter.post("/cancel-appointment", authDoctor, appointmentCancel);
doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete);
doctorRouter.post("/dashboard", authDoctor, doctorDashboard);
doctorRouter.post("/profile", authDoctor, doctorProfile);
doctorRouter.post("/update-profile", authDoctor, updateDoctorProfile);
doctorRouter.post("/change-availability", authDoctor, changeAvailablity);
doctorRouter.post("/register-doctor", registerDoctor);
/* =========================
   PUBLIC
========================= */

doctorRouter.get("/list", doctorList);

export default doctorRouter;
