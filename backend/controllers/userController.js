import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import validator from "validator"
import userModel from "../models/userModel.js"
import doctorModel from "../models/doctorModel.js"
import appointmentModel from "../models/appointmentModel.js"
import { v2 as cloudinary } from "cloudinary"
import stripe from "stripe"
import nodemailer from "nodemailer"

// ---------------- STRIPE INIT ----------------
const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

// ---------------- EMAIL CONFIG ----------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// ---------------- OTP HELPERS ----------------
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString()

const sendOTPEmail = async (email, otp, name) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Bludz - Email Verification OTP",
    html: `
      <h3>Hello ${name}</h3>
      <p>Your OTP is <b>${otp}</b></p>
      <p>Valid for 10 minutes.</p>
    `,
  })
}

// ---------------- SEND OTP ----------------
const sendOTP = async (req, res) => {
  try {
    const { email, name, password, type } = req.body

    if (!validator.isEmail(email))
      return res.json({ success: false, message: "Invalid email" })

    if (type === "register") {
      const existing = await userModel.findOne({ email })
      if (existing?.isVerified)
        return res.json({ success: false, message: "User already exists" })

      if (!name || !password)
        return res.json({ success: false, message: "Missing details" })

      if (password.length < 8)
        return res.json({ success: false, message: "Weak password" })

      const otp = generateOTP()
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)
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
      return res.json({ success: true, message: "OTP sent", email })
    }

    if (type === "login") {
      const user = await userModel.findOne({ email })
      if (!user)
        return res.json({ success: false, message: "User not found" })

      if (!user.isVerified)
        return res.json({ success: false, message: "Verify email first" })

      const match = await bcrypt.compare(password, user.password)
      if (!match)
        return res.json({ success: false, message: "Invalid credentials" })

      const otp = generateOTP()
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

      await userModel.findByIdAndUpdate(user._id, { otp, otpExpiry })
      await sendOTPEmail(email, otp, user.name)

      return res.json({ success: true, message: "OTP sent", email })
    }
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// ---------------- VERIFY OTP ----------------
const verifyOTP = async (req, res) => {
  try {
    const { email, otp, type } = req.body
    const user = await userModel.findOne({ email })

    if (!user) return res.json({ success: false, message: "User not found" })
    if (user.otp !== otp)
      return res.json({ success: false, message: "Invalid OTP" })
    if (new Date() > user.otpExpiry)
      return res.json({ success: false, message: "OTP expired" })

    await userModel.findByIdAndUpdate(user._id, {
      otp: null,
      otpExpiry: null,
      isVerified: true,
    })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
    res.json({ success: true, token, message: "Success" })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// ---------------- RESEND OTP ----------------
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body
    const user = await userModel.findOne({ email })
    if (!user) return res.json({ success: false, message: "User not found" })

    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    await userModel.findByIdAndUpdate(user._id, { otp, otpExpiry })
    await sendOTPEmail(email, otp, user.name)

    res.json({ success: true, message: "OTP resent" })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// ---------------- PROFILE ----------------
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

// ---------------- APPOINTMENTS ----------------
const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body

    const doctor = await doctorModel.findById(docId).select("-password")
    if (!doctor || !doctor.available) {
      return res.json({ success: false, message: "Doctor not available" })
    }

    // Slot check
    doctor.slots_booked[slotDate] = doctor.slots_booked[slotDate] || []
    if (doctor.slots_booked[slotDate].includes(slotTime)) {
      return res.json({ success: false, message: "Slot not available" })
    }

    doctor.slots_booked[slotDate].push(slotTime)
    await doctor.save()

    const user = await userModel.findById(userId).select("-password")

    const appointmentData = {
      userId,
      docId,
      userData: user,
      docData: doctor,
      amount: doctor.fees,
      slotDate,
      slotTime,
      date: Date.now(),
    }

    await appointmentModel.create(appointmentData)

    res.json({ success: true, message: "Appointment booked successfully" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}


const listAppointment = async (req, res) => {
  const appointments = await appointmentModel.find({ userId: req.body.userId })
  res.json({ success: true, appointments })
}

const cancelAppointment = async (req, res) => {
  await appointmentModel.findByIdAndUpdate(req.body.appointmentId, {
    cancelled: true,
  })
  res.json({ success: true, message: "Appointment cancelled" })
}

// ---------------- STRIPE ----------------
const paymentStripe = async (req, res) => {
  const appointment = await appointmentModel.findById(req.body.appointmentId)

  const session = await stripeInstance.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: { name: "Appointment Fee" },
          unit_amount: appointment.amount * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.headers.origin}/success`,
    cancel_url: `${req.headers.origin}/cancel`,
  })

  res.json({ success: true, session_url: session.url })
}

const verifyStripe = async (req, res) => {
  await appointmentModel.findByIdAndUpdate(req.body.appointmentId, {
    payment: true,
  })
  res.json({ success: true })
}

// ---------------- EXPORTS ----------------
export {
  sendOTP,
  verifyOTP,
  resendOTP,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentStripe,
  verifyStripe,
}
