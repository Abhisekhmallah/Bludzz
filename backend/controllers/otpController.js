import OTP from "../models/otpModel.js";
import { sendWhatsAppOTP } from "../services/otpServices.js";

const OTP_EXPIRY = Number(process.env.OTP_EXPIRY_MINUTES || 5);

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const sendOTP = async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: "Phone required" });

  await OTP.deleteMany({ phone });

  const otp = generateOTP();

  await OTP.create({
    phone,
    otp,
    expiresAt: new Date(Date.now() + OTP_EXPIRY * 60000)
  });

  await sendWhatsAppOTP(phone, otp);

  res.json({ success: true });
};

export const verifyOTP = async (req, res) => {
  const { phone, otp } = req.body;

  const record = await OTP.findOne({ phone, otp });
  if (!record) return res.status(400).json({ message: "Invalid OTP" });
  if (record.expiresAt < new Date())
    return res.status(400).json({ message: "OTP expired" });

  record.verified = true;
  await record.save();

  res.json({ success: true });
};
