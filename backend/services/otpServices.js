import nodemailer from "nodemailer";
import Twilio from "twilio";

// ---------------- OTP GENERATOR ----------------
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ---------------- EMAIL OTP ----------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTPEmail = async (email, otp, name = "") => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Bludz - OTP Verification",
    html: `
      <h2>Hello ${name}</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP is valid for 10 minutes.</p>
    `,
  });
};

// ---------------- SMS OTP (TWILIO) ----------------
const twilioClient = Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendOTPSMS = async (phone, otp) => {
  await twilioClient.messages.create({
    body: `Your Bludz OTP is ${otp}. Valid for 10 minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });
};
