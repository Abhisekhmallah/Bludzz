import Prescription from "../models/Prescription.js"
import Appointment from "../models/appointmentModel.js"

/* ===============================
   USER: Upload Prescription
================================ */
export const uploadPrescription = async (req, res) => {
  try {
    const { appointmentId, notes } = req.body

    if (!req.file)
      return res.status(400).json({ message: "Prescription file required" })

    const appointment = await Appointment.findById(appointmentId)

    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" })

    if (appointment.userId !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" })

    if (appointment.prescriptionId)
      return res
        .status(400)
        .json({ message: "Prescription already uploaded" })

    const prescription = await Prescription.create({
      appointmentId: appointment._id,
      userId: appointment.userId,
      docId: appointment.docId,
      fileUrl: req.file.path,
      notes
    })

    appointment.prescriptionId = prescription._id
    await appointment.save()

    res.status(201).json({
      message: "Prescription uploaded successfully",
      prescription
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

/* ===============================
   DOCTOR: Read Prescriptions
================================ */
export const getDoctorPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      docId: req.user.id
    })

    res.json(prescriptions)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

/* ===============================
   LAB: Read Prescriptions
   (via appointments handled by lab)
================================ */
export const getLabPrescriptions = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      labId: req.user.id,
      prescriptionId: { $ne: null }
    })

    const prescriptionIds = appointments.map(a => a.prescriptionId)

    const prescriptions = await Prescription.find({
      _id: { $in: prescriptionIds }
    })

    res.json(prescriptions)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

/* ===============================
   ADMIN: Read All Prescriptions
================================ */
export const getAllPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
    res.json(prescriptions)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
