import express from "express";
import uploadPrescription from "../middleware/uploadPrescription.js";

import {
  uploadPrescription as uploadCtrl,
  getDoctorPrescriptions,
  getLabPrescriptions,
  getAllPrescriptions
} from "../controllers/prescriptionController.js";

// 🔑 USE EXISTING AUTH MIDDLEWARES
import authUser from "../middleware/authUser.js";
import authDoctor from "../middleware/authDoctor.js";
import authAdmin from "../middleware/authAdmin.js";

const router = express.Router();

// ===============================
// USER uploads prescription
// ===============================
router.post(
  "/upload",
  authUser,
  uploadPrescription.single("prescription"),
  uploadCtrl
);

// ===============================
// DOCTOR views prescriptions
// ===============================
router.get("/doctor", authDoctor, getDoctorPrescriptions);

// ===============================
// LAB views prescriptions
// ===============================
router.get("/lab", authDoctor, getLabPrescriptions); 
// or authLab if you have one

// ===============================
// ADMIN views all prescriptions
// ===============================
router.get("/admin", authAdmin, getAllPrescriptions);

export default router;
