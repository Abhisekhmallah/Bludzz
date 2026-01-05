import nodemailer from "nodemailer";
console.log("📧 EMAIL CONFIG:", {
  user: process.env.EMAIL_USER,
  passExists: !!process.env.EMAIL_PASS
});


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// 🔍 Verify transporter on server start
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter error:", error);
  } else {
    console.log("✅ Email transporter ready");
  }
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Bludz Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
  } catch (error) {
    console.error("❌ sendEmail failed:", error);
    throw error; // VERY IMPORTANT
  }
};

export default sendEmail;
