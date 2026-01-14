import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import validator from "validator"
import nodemailer from "nodemailer"
import { v2 as cloudinary } from "cloudinary"

import userModel from "../models/userModel.js"
import doctorModel from "../models/doctorModel.js"
import appointmentModel from "../models/appointmentModel.js"

/* =====================================================
   EMAIL CONFIG (NON-BLOCKING)
===================================================== */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
})

transporter.verify((err) => {
  if (err) {
    console.error("[EMAIL] SMTP not ready:", err.message)
  } else {
    console.log("[EMAIL] SMTP ready")
  }
})

/* =====================================================
   OTP HELPERS
===================================================== */
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString()

const sendOTPEmail = async (email, otp, name) => {
  try {
    await transporter.sendMail({
      from: `"Bludz" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Bludz - Email Verification OTP",
      html: `
        <h3>Hello ${name}</h3>
        <p>Your OTP is <b>${otp}</b></p>
        <p>This OTP is valid for 10 minutes.</p>
      `,
    })
    console.log("[EMAIL] OTP sent →", email)
  } catch (err) {
    console.error("[EMAIL] OTP failed:", err.message)
  }
}

/* =====================================================
   SEND OTP (IMMEDIATE RESPONSE – PRODUCTION SAFE)
===================================================== */
const sendOTP = (req, res) => {
  const { email, name, password, type } = req.body

  /* ---------- FAST SYNC VALIDATION ---------- */
  if (!email || !type) {
    return res.json({ success: false, message: "Missing data" })
  }

  if (!validator.isEmail(email)) {
    return res.json({ success: false, message: "Invalid email" })
  }

  /* ---------- RESPOND IMMEDIATELY ---------- */
  res.json({ success: true, message: "OTP processing", email })

  /* ---------- BACKGROUND WORK ---------- */
  setImmediate(async () => {
    try {
      const otp = generateOTP()
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

      /* -------- REGISTER FLOW -------- */
      if (type === "register") {
        if (!name || !password || password.length < 8) return

        const existing = await userModel.findOne({ email })
        if (existing?.isVerified) return

        const hashedPassword = await bcrypt.hash(password, 10)

        if (existing) {
          await userModel.findByIdAndUpdate(existing._id, {
            name,
            password: hashedPassword,
            otp,
            otpExpiry,
          })
        } else {
          await userModel.create({
            name,
            email,
            password: hashedPassword,
            otp,
            otpExpiry,
            isVerified: false,
          })
        }

        await sendOTPEmail(email, otp, name)
        return
      }

      /* -------- LOGIN FLOW -------- */
      if (type === "login") {
        const user = await userModel.findOne({ email })
        if (!user || !user.isVerified) return

        const match = await bcrypt.compare(password, user.password)
        if (!match) return

        await userModel.findByIdAndUpdate(user._id, { otp, otpExpiry })
        await sendOTPEmail(email, otp, user.name)
      }
    } catch (err) {
      console.error("[SEND_OTP BACKGROUND ERROR]", err)
    }
  })
}

/* =====================================================
   VERIFY OTP
===================================================== */
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body

    const user = await userModel.findOne({ email })
    if (!user)
      return res.json({ success: false, message: "User not found" })

    if (user.otp !== otp)
      return res.json({ success: false, message: "Invalid OTP" })

    if (new Date() > user.otpExpiry)
      return res.json({ success: false, message: "OTP expired" })

    await userModel.findByIdAndUpdate(user._id, {
      otp: null,
      otpExpiry: null,
      isVerified: true,
    })

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.json({ success: true, token, message: "Login successful" })
  } catch (err) {
    console.error("[VERIFY OTP ERROR]", err)
    res.json({ success: false, message: "OTP verification failed" })
  }
}

/* =====================================================
   RESEND OTP
===================================================== */
const resendOTP = (req, res) => {
  const { email } = req.body

  res.json({ success: true, message: "OTP processing" })

  setImmediate(async () => {
    try {
      const user = await userModel.findOne({ email })
      if (!user) return

      const otp = generateOTP()
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

      await userModel.findByIdAndUpdate(user._id, { otp, otpExpiry })
      await sendOTPEmail(email, otp, user.name)
    } catch (err) {
      console.error("[RESEND OTP ERROR]", err)
    }
  })
}

/* =====================================================
   PROFILE
===================================================== */
const getProfile = async (req, res) => {
  const user = await userModel
    .findById(req.body.userId)
    .select("-password -otp")

  res.json({ success: true, user })
}

const updateProfile = async (req, res) => {
  const { userId, name, phone, dob, gender, address } = req.body

  await userModel.findByIdAndUpdate(userId, {
    name,
    phone,
    dob,
    gender,
    address: JSON.parse(address),
  })

  if (req.file) {
    const img = await cloudinary.uploader.upload(req.file.path)
    await userModel.findByIdAndUpdate(userId, { image: img.secure_url })
  }

  res.json({ success: true, message: "Profile updated" })
}

/* =====================================================
   APPOINTMENTS
===================================================== */
const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body

    const doctor = await doctorModel.findById(docId).select("-password")
    if (!doctor || !doctor.available)
      return res.json({ success: false, message: "Doctor not available" })

    doctor.slots_booked[slotDate] = doctor.slots_booked[slotDate] || []
    if (doctor.slots_booked[slotDate].includes(slotTime))
      return res.json({ success: false, message: "Slot not available" })

    doctor.slots_booked[slotDate].push(slotTime)
    await doctor.save()

    const user = await userModel.findById(userId).select("-password")

    await appointmentModel.create({
      userId,
      docId,
      userData: user,
      docData: doctor,
      amount: doctor.fees,
      slotDate,
      slotTime,
      date: Date.now(),
    })

    res.json({ success: true, message: "Appointment booked successfully" })
  } catch (err) {
    console.error(err)
    res.json({ success: false, message: err.message })
  }
}

const listAppointment = async (req, res) => {
  const appointments = await appointmentModel.find({
    userId: req.body.userId,
  })
  res.json({ success: true, appointments })
}

const cancelAppointment = async (req, res) => {
  await appointmentModel.findByIdAndUpdate(req.body.appointmentId, {
    cancelled: true,
  })
  res.json({ success: true, message: "Appointment cancelled" })
}

/* =====================================================
   EXPORTS
===================================================== */
export {
  sendOTP,
  verifyOTP,
  resendOTP,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
}
