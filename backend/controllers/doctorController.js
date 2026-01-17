import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import axios from "axios"

import doctorModel from "../models/doctorModel.js"
import appointmentModel from "../models/appointmentModel.js"
import DoctorRegistration from "../models/DoctorRegistration.js"

/* =====================================================
   BREVO EMAIL HELPER (ADMIN NOTIFICATION)
===================================================== */
const sendAdminEmail = async (doctorData) => {
  const {
    name,
    email,
    phone,
    specialization,
    experienceYears,
    clinicAddress,
  } = doctorData

  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Bludz Platform",
          email: process.env.EMAIL_FROM,
        },
        to: [
          {
            email: process.env.ADMIN_EMAIL, // admin email
          },
        ],
        subject: "New Doctor Registration – Bludz",
        htmlContent: `
          <h3>New Doctor Registration</h3>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Phone:</b> ${phone}</p>
          <p><b>Specialization:</b> ${specialization}</p>
          <p><b>Experience:</b> ${experienceYears} years</p>
          <p><b>Clinic Address:</b> ${clinicAddress}</p>
          <p><b>Status:</b> Pending Approval</p>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    )

    console.log("✅ Admin notified via Brevo")
  } catch (err) {
    console.error(
      "❌ Admin email failed:",
      err.response?.data || err.message
    )
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

    // 1️⃣ Validate input
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

    // 2️⃣ Prevent duplicate registration
    const alreadyExists =
      (await DoctorRegistration.findOne({ email })) ||
      (await doctorModel.findOne({ email }))

    if (alreadyExists) {
      return res.status(409).json({
        success: false,
        message: "Doctor already registered with this email",
      })
    }

    // 3️⃣ Save doctor registration (PENDING APPROVAL)
    const doctor = await DoctorRegistration.create({
      name,
      email,
      phone,
      specialization,
      experienceYears,
      clinicAddress,
    })

    // 4️⃣ Respond immediately (DO NOT BLOCK UI)
    res.status(201).json({
      success: true,
      message: "Doctor registration submitted successfully",
      doctor,
    })

    // 5️⃣ Notify admin in background
    sendAdminEmail(doctor)
  } catch (error) {
    console.error("REGISTER DOCTOR ERROR:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to submit doctor registration",
    })
  }
}

/* =========================
   DOCTOR LOGIN
========================= */
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await doctorModel.findOne({ email })

    if (!user)
      return res.json({ success: false, message: "Invalid credentials" })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch)
      return res.json({ success: false, message: "Invalid credentials" })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    })

    res.json({ success: true, token })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

/* =========================
   APPOINTMENTS
========================= */
const appointmentsDoctor = async (req, res) => {
  try {
    const { docId } = req.body
    const appointments = await appointmentModel.find({ docId })
    res.json({ success: true, appointments })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

const appointmentCancel = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body
    const appointmentData = await appointmentModel.findById(appointmentId)

    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        cancelled: true,
      })
      return res.json({ success: true, message: "Appointment Cancelled" })
    }

    res.json({ success: false, message: "Unauthorized action" })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

const appointmentComplete = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body
    const appointmentData = await appointmentModel.findById(appointmentId)

    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isCompleted: true,
      })
      return res.json({ success: true, message: "Appointment Completed" })
    }

    res.json({ success: false, message: "Unauthorized action" })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

/* =========================
   DOCTOR DATA
========================= */
const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password -email")
    res.json({ success: true, doctors })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

const changeAvailablity = async (req, res) => {
  try {
    const { docId } = req.body
    const doc = await doctorModel.findById(docId)
    await doctorModel.findByIdAndUpdate(docId, {
      available: !doc.available,
    })
    res.json({ success: true, message: "Availability Changed" })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

const doctorProfile = async (req, res) => {
  try {
    const { docId } = req.body
    const profileData = await doctorModel
      .findById(docId)
      .select("-password")
    res.json({ success: true, profileData })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

const updateDoctorProfile = async (req, res) => {
  try {
    const { docId, fees, address, available } = req.body
    await doctorModel.findByIdAndUpdate(docId, {
      fees,
      address,
      available,
    })
    res.json({ success: true, message: "Profile Updated" })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

/* =========================
   DASHBOARD
========================= */
const doctorDashboard = async (req, res) => {
  try {
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
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

/* =========================
   EXPORTS
========================= */
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
