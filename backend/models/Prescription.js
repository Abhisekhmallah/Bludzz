import mongoose from "mongoose"

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "appointment",
      required: true,
      unique: true
    },

    userId: {
      type: String,
      required: true
    },

    docId: {
      type: String,
      required: true
    },

    fileUrl: {
      type: String,
      required: true
    },

    notes: {
      type: String
    }
  },
  { timestamps: true }
)

export default mongoose.model("Prescription", prescriptionSchema)
