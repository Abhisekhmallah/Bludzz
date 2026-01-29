import express from "express";
import {
  loginAdmin,
  appointmentsAdmin,
  appointmentCancel,
  addDoctor,
  allDoctors,
  adminDashboard,
  removeDoctor,
} from "../controllers/adminController.js";

import { changeAvailablity } from "../controllers/doctorController.js";
import authAdmin from "../middleware/authAdmin.js";
import upload from "../middleware/multer.js";

const adminRouter = express.Router();

/* =========================
   AUTH
========================= */
adminRouter.post("/login", loginAdmin);

/* =========================
   DOCTORS
========================= */
adminRouter.post(
  "/add-doctor",
  authAdmin,
  upload.single("image"),
  addDoctor
);

adminRouter.get("/all-doctors", authAdmin, allDoctors);
adminRouter.post("/remove-doctor", authAdmin, removeDoctor);
adminRouter.post("/change-availability", authAdmin, changeAvailablity);

/* =========================
   APPOINTMENTS
========================= */
adminRouter.get("/appointments", authAdmin, appointmentsAdmin);
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel);

/* =========================
   DASHBOARD
========================= */
adminRouter.get("/dashboard", authAdmin, adminDashboard);

export default adminRouter;
