import labModel from "../models/labModel.js";
import { v2 as cloudinary } from "cloudinary";

// ------------------------------
// Admin: Add new lab
// ------------------------------
export const addLab = async (req, res) => {
  try {
    const {
      name,
      email,
      address,
      city,
      phone,
      about,
      services = "",
      fees = 0,
    } = req.body;

    let imageUrl = "";

    // ✅ Upload image to Cloudinary if file is provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "labs",
      });
      imageUrl = result.secure_url;
    }

    // ✅ Create new lab (available by default)
    const lab = await labModel.create({
      name,
      email,
      image: imageUrl,
      address,
      city,
      phone,
      about,
      services: services ? services.split(",").map((s) => s.trim()) : [],
      fees,
      available: true, // ✅ Fix: make newly added lab visible on frontend
    });

    res.status(201).send({ success: true, message: "Lab added", lab });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: error.message });
  }
};

// ------------------------------
// Admin: Get all labs
// ------------------------------
export const allLabs = async (req, res) => {
  try {
    const labs = await labModel.find().sort({ createdAt: -1 });
    res.send({ success: true, labs });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

// ------------------------------
// Public: List labs (visible in frontend)
// ------------------------------
export const publicLabsList = async (req, res) => {
  try {
    const labs = await labModel.find({ available: true }).sort({ createdAt: -1 });
    res.send({ success: true, labs });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

// ------------------------------
// Public: Single lab details (lab profile)
// ------------------------------
export const labProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const lab = await labModel.findById(id);
    if (!lab)
      return res.status(404).send({ success: false, message: "Lab not found" });
    res.send({ success: true, lab });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

// ------------------------------
// Admin: Toggle lab availability
// ------------------------------
export const changeLabAvailability = async (req, res) => {
  try {
    const { id } = req.body;
    const lab = await labModel.findById(id);
    if (!lab)
      return res.status(404).send({ success: false, message: "Lab not found" });

    lab.available = !lab.available;
    await lab.save();

    res.send({ success: true, message: "Availability updated" });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};
