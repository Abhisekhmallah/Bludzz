import mongoose from "mongoose";

const doctorRegistrationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    specialization: { type: String, required: true },
    experienceYears: { type: Number, required: true },
    clinicAddress: { type: String, required: true },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

export default mongoose.model(
  "DoctorRegistration",
  doctorRegistrationSchema
);
