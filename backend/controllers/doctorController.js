import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import axios from "axios"

import doctorModel from "../models/doctorModel.js"
import appointmentModel from "../models/appointmentModel.js"
import DoctorRegistration from "../models/DoctorRegistration.js"

/* =====================================================
   BREVO EMAIL – ADMIN NOTIFICATION (NON-BLOCKING)
===================================================== */
const notifyAdmin = async (doctor) => {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Bludz",
          email: process.env.EMAIL_FROM,
        },
        to: [{ email: process.env.ADMIN_EMAIL }],
        subject: "New Doctor Registration – Bludz",
        htmlContent: `
          <h3>New Doctor Registration</h3>
          <p><b>Name:</b> ${doctor.name}</p>
          <p><b>Email:</b> ${doctor.email}</p>
          <p><b>Phone:</b> ${doctor.phone}</p>
          <p><b>Specialization:</b> ${doctor.specialization}</p>
          <p><b>Experience:</b> ${doctor.experienceYears} years</p>
          <p><b>Clinic Address:</b> ${doctor.clinicAddress}</p>
          <p>Status: Pending Approval</p>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    )
  } catch (err) {
    console.error("Admin email failed:", err.message)
  }
}

/* =========================
   DOCTOR SELF REGISTRATION
========================= */
const registerDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      specialization,
      experienceYears,
      clinicAddress,
    } = req.body

    const document = req.file?.path

    if (
      !name ||
      !email ||
      !phone ||
      !specialization ||
      !experienceYears ||
      !clinicAddress
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      })
    }

    if (!document) {
      return res.status(400).json({
        success: false,
        message: "Medical document is required",
      })
    }

    const exists =
      (await DoctorRegistration.findOne({ email })) ||
      (await doctorModel.findOne({ email }))

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Doctor already registered with this email",
      })
    }

    const doctor = await DoctorRegistration.create({
      name,
      email,
      phone,
      specialization,
      experienceYears,
      clinicAddress,
      document,
      status: "pending",
    })

    res.status(201).json({
      success: true,
      message: "Doctor registration submitted successfully",
    })

    setImmediate(() => notifyAdmin(doctor))
  } catch (err) {
    console.error("REGISTER DOCTOR ERROR:", err)
    res.status(500).json({
      success: false,
      message: "Failed to submit doctor registration",
    })
  }
}

/* =========================
   DOCTOR LOGIN (BLOCK REMOVED)
========================= */
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body

    const doctor = await doctorModel.findOne({
      email,
      isActive: true,
    })

    if (!doctor)
      return res.json({ success: false, message: "Invalid credentials" })

    const match = await bcrypt.compare(password, doctor.password)
    if (!match)
      return res.json({ success: false, message: "Invalid credentials" })

    const token = jwt.sign(
      { id: doctor._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.json({ success: true, token })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

/* =========================
   APPOINTMENTS
========================= */
const appointmentsDoctor = async (req, res) => {
  const { docId } = req.body
  const appointments = await appointmentModel.find({ docId })
  res.json({ success: true, appointments })
}

const appointmentCancel = async (req, res) => {
  const { docId, appointmentId } = req.body
  const appointment = await appointmentModel.findById(appointmentId)

  if (appointment && appointment.docId === docId) {
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    })
    return res.json({ success: true, message: "Appointment Cancelled" })
  }

  res.json({ success: false, message: "Unauthorized action" })
}

const appointmentComplete = async (req, res) => {
  const { docId, appointmentId } = req.body
  const appointment = await appointmentModel.findById(appointmentId)

  if (appointment && appointment.docId === docId) {
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      isCompleted: true,
    })
    return res.json({ success: true, message: "Appointment Completed" })
  }

  res.json({ success: false, message: "Unauthorized action" })
}

/* =========================
   PUBLIC DOCTOR LIST (🔥 FIX)
========================= */
const doctorList = async (req, res) => {
  const doctors = await doctorModel
    .find({ isActive: true })
    .select("-password -email")

  res.json({ success: true, doctors })
}

/* =========================
   PROFILE & DASHBOARD
========================= */
const changeAvailablity = async (req, res) => {
  const { docId } = req.body
  const doc = await doctorModel.findById(docId)

  await doctorModel.findByIdAndUpdate(docId, {
    available: !doc.available,
  })

  res.json({ success: true, message: "Availability Changed" })
}

const doctorProfile = async (req, res) => {
  const { docId } = req.body
  const profileData = await doctorModel
    .findById(docId)
    .select("-password")

  res.json({ success: true, profileData })
}

const updateDoctorProfile = async (req, res) => {
  const { docId, fees, address, available } = req.body

  await doctorModel.findByIdAndUpdate(docId, {
    fees,
    address,
    available,
  })

  res.json({ success: true, message: "Profile Updated" })
}

const doctorDashboard = async (req, res) => {
  const { docId } = req.body
  const appointments = await appointmentModel.find({ docId })

  let earnings = 0
  let patients = []

  appointments.forEach((item) => {
    if (item.isCompleted || item.payment) earnings += item.amount
    if (!patients.includes(item.userId)) patients.push(item.userId)
  })

  res.json({
    success: true,
    dashData: {
      earnings,
      appointments: appointments.length,
      patients: patients.length,
      latestAppointments: appointments.reverse(),
    },
  })
}

export {
  registerDoctor,
  loginDoctor,
  appointmentsDoctor,
  appointmentCancel,
  appointmentComplete,
  doctorList,
  changeAvailablity,
  doctorProfile,
  updateDoctorProfile,
  doctorDashboard,
}