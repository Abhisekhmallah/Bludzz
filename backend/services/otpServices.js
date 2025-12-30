import nodemailer from "nodemailer";
import twilio from "twilio";

/**
 * Generate 6-digit numeric OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP via Email
 */
const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
      }
    });

    await transporter.sendMail({
      from: `"OTP Verification" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "Your OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>OTP Verification</h2>
          <p>Your OTP code is:</p>
          <h1>${otp}</h1>
          <p>This OTP is valid for 5 minutes.</p>
        </div>
      `
    });
  } catch (error) {
    console.error("Email OTP send failed:", error);
    throw new Error("Failed to send OTP email");
  }
};

/**
 * Send OTP via WhatsApp (Twilio)
 */
const sendWhatsAppOTP = async (phone, otp) => {
  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM, // whatsapp:+14155238886
      to: `whatsapp:${phone}`,                // whatsapp:+91XXXXXXXXXX
      body: `Your verification OTP is ${otp}. It is valid for 5 minutes.`
    });
  } catch (error) {
    console.error("WhatsApp OTP send failed:", error);
    throw new Error("Failed to send WhatsApp OTP");
  }
};

export {
  generateOTP,
  sendOTPEmail,
  sendWhatsAppOTP
};
