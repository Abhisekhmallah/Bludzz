import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import validator from "validator"
import userModel from "../models/userModel.js"
import doctorModel from "../models/doctorModel.js"
import appointmentModel from "../models/appointmentModel.js"
import { v2 as cloudinary } from "cloudinary"
import stripe from "stripe"
import razorpay from "razorpay"
import nodemailer from "nodemailer"

// Gateway Initialize
const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)
const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail", // or your email service
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
})

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send OTP via email
const sendOTPEmail = async (email, otp, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Bludz - Email Verification OTP",
    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #5F6FFF;">Prescripto Email Verification</h2>
                <p>Hello ${name},</p>
                <p>Your OTP for email verification is:</p>
                <div style="background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #5F6FFF; font-size: 32px; margin: 0;">${otp}</h1>
                </div>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <p>Best regards,<br>Prescripto Team</p>
            </div>
        `,
  }

  await transporter.sendMail(mailOptions)
}

// API to send OTP for registration/login
const sendOTP = async (req, res) => {
  try {
    const { email, name, password, type } = req.body // type: 'register' or 'login'

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email" })
    }

    if (type === "register") {
      // Check if user already exists
      const existingUser = await userModel.findOne({ email })
      if (existingUser && existingUser.isVerified) {
        return res.json({ success: false, message: "User already exists" })
      }

      // Validate required fields for registration
      if (!name || !password) {
        return res.json({ success: false, message: "Missing Details" })
      }

      // Validate password strength
      if (password.length < 8) {
        return res.json({ success: false, message: "Please enter a strong password" })
      }

      // Generate OTP
      const otp = generateOTP()
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

      // Hash password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      if (existingUser && !existingUser.isVerified) {
        // Update existing unverified user
        await userModel.findByIdAndUpdate(existingUser._id, {
          name,
          password: hashedPassword,
          otp,
          otpExpiry,
          isVerified: false,
        })
      } else {
        // Create new user
        const userData = {
          name,
          email,
          password: hashedPassword,
          otp,
          otpExpiry,
          isVerified: false,
        }
        const newUser = new userModel(userData)
        await newUser.save()
      }

      // Send OTP email
      await sendOTPEmail(email, otp, name)

      res.json({
        success: true,
        message: "OTP sent to your email address",
        email: email,
      })
    } else if (type === "login") {
      // Check if user exists
      const user = await userModel.findOne({ email })
      if (!user) {
        return res.json({ success: false, message: "User does not exist" })
      }

      if (!user.isVerified) {
        return res.json({ success: false, message: "Please verify your email first" })
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        return res.json({ success: false, message: "Invalid credentials" })
      }

      // Generate OTP for login
      const otp = generateOTP()
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

      // Update user with OTP
      await userModel.findByIdAndUpdate(user._id, {
        otp,
        otpExpiry,
      })

      // Send OTP email
      await sendOTPEmail(email, otp, user.name)

      res.json({
        success: true,
        message: "OTP sent to your email address",
        email: email,
      })
    }
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to verify OTP and complete authentication
const verifyOTP = async (req, res) => {
  try {
    const { email, otp, type } = req.body

    // Find user by email
    const user = await userModel.findOne({ email })
    if (!user) {
      return res.json({ success: false, message: "User not found" })
    }

    // Check if OTP matches and is not expired
    if (user.otp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" })
    }

    if (new Date() > user.otpExpiry) {
      return res.json({ success: false, message: "OTP has expired" })
    }

    if (type === "register") {
      // Mark user as verified and clear OTP
      await userModel.findByIdAndUpdate(user._id, {
        isVerified: true,
        otp: null,
        otpExpiry: null,
      })

      // Generate JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

      res.json({
        success: true,
        message: "Registration successful",
        token,
      })
    } else if (type === "login") {
      // Clear OTP and generate token
      await userModel.findByIdAndUpdate(user._id, {
        otp: null,
        otpExpiry: null,
      })

      // Generate JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

      res.json({
        success: true,
        message: "Login successful",
        token,
      })
    }
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to resend OTP
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body

    // Find user by email
    const user = await userModel.findOne({ email })
    if (!user) {
      return res.json({ success: false, message: "User not found" })
    }

    // Generate new OTP
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    // Update user with new OTP
    await userModel.findByIdAndUpdate(user._id, {
      otp,
      otpExpiry,
    })

    // Send OTP email
    await sendOTPEmail(email, otp, user.name)

    res.json({
      success: true,
      message: "New OTP sent to your email address",
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// Modified API to register user (now just for backward compatibility)
const registerUser = async (req, res) => {
  try {
    // Redirect to OTP-based registration
    return res.json({
      success: false,
      message: "Please use OTP-based registration",
      useOTP: true,
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// Modified API to login user (now just for backward compatibility)
const loginUser = async (req, res) => {
  try {
    // Redirect to OTP-based login
    return res.json({
      success: false,
      message: "Please use OTP-based login",
      useOTP: true,
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to get user profile data
const getProfile = async (req, res) => {
  try {
    const { userId } = req.body
    const userData = await userModel.findById(userId).select("-password -otp -otpExpiry")
    res.json({ success: true, userData })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to update user profile
const updateProfile = async (req, res) => {
  try {
    const { userId, name, phone, address, dob, gender } = req.body
    const imageFile = req.file

    if (!name || !phone || !dob || !gender) {
      return res.json({ success: false, message: "Data Missing" })
    }

    await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })

    if (imageFile) {
      // upload image to cloudinary
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
      const imageURL = imageUpload.secure_url
      await userModel.findByIdAndUpdate(userId, { image: imageURL })
    }

    res.json({ success: true, message: "Profile Updated" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to book appointment
const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body
    const docData = await doctorModel.findById(docId).select("-password")

    if (!docData.available) {
      return res.json({ success: false, message: "Doctor Not Available" })
    }

    const slots_booked = docData.slots_booked

    // checking for slot availablity
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: "Slot Not Available" })
      } else {
        slots_booked[slotDate].push(slotTime)
      }
    } else {
      slots_booked[slotDate] = []
      slots_booked[slotDate].push(slotTime)
    }

    const userData = await userModel.findById(userId).select("-password")
    delete docData.slots_booked

    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(),
    }

    const newAppointment = new appointmentModel(appointmentData)
    await newAppointment.save()

    // save new slots data in docData
    await doctorModel.findByIdAndUpdate(docId, { slots_booked })

    res.json({ success: true, message: "Appointment Booked" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { userId, appointmentId } = req.body
    const appointmentData = await appointmentModel.findById(appointmentId)

    // verify appointment user
    if (appointmentData.userId !== userId) {
      return res.json({ success: false, message: "Unauthorized action" })
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

    // releasing doctor slot
    const { docId, slotDate, slotTime } = appointmentData
    const doctorData = await doctorModel.findById(docId)
    const slots_booked = doctorData.slots_booked
    slots_booked[slotDate] = slots_booked[slotDate].filter((e) => e !== slotTime)
    await doctorModel.findByIdAndUpdate(docId, { slots_booked })

    res.json({ success: true, message: "Appointment Cancelled" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
  try {
    const { userId } = req.body
    const appointments = await appointmentModel.find({ userId })
    res.json({ success: true, appointments })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to make payment of appointment using razorpay
const paymentRazorpay = async (req, res) => {
  try {
    const { appointmentId } = req.body
    const appointmentData = await appointmentModel.findById(appointmentId)

    if (!appointmentData || appointmentData.cancelled) {
      return res.json({ success: false, message: "Appointment Cancelled or not found" })
    }

    // creating options for razorpay payment
    const options = {
      amount: appointmentData.amount * 100,
      currency: process.env.CURRENCY,
      receipt: appointmentId,
    }

    // creation of an order
    const order = await razorpayInstance.orders.create(options)
    res.json({ success: true, order })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to verify payment of razorpay
const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

    if (orderInfo.status === "paid") {
      await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true })
      res.json({ success: true, message: "Payment Successful" })
    } else {
      res.json({ success: false, message: "Payment Failed" })
    }
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to make payment of appointment using Stripe
const paymentStripe = async (req, res) => {
  try {
    const { appointmentId } = req.body
    const { origin } = req.headers
    const appointmentData = await appointmentModel.findById(appointmentId)

    if (!appointmentData || appointmentData.cancelled) {
      return res.json({ success: false, message: "Appointment Cancelled or not found" })
    }

    const currency = process.env.CURRENCY.toLocaleLowerCase()
    const line_items = [
      {
        price_data: {
          currency,
          product_data: {
            name: "Appointment Fees",
          },
          unit_amount: appointmentData.amount * 100,
        },
        quantity: 1,
      },
    ]

    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&appointmentId=${appointmentData._id}`,
      cancel_url: `${origin}/verify?success=false&appointmentId=${appointmentData._id}`,
      line_items: line_items,
      mode: "payment",
    })

    res.json({ success: true, session_url: session.url })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const verifyStripe = async (req, res) => {
  try {
    const { appointmentId, success } = req.body

    if (success === "true") {
      await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true })
      return res.json({ success: true, message: "Payment Successful" })
    }

    res.json({ success: false, message: "Payment Failed" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

export {
  loginUser,
  registerUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentRazorpay,
  verifyRazorpay,
  paymentStripe,
  verifyStripe,
  sendOTP,
  verifyOTP,
  resendOTP,
}
