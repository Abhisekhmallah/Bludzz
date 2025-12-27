import mongoose from "mongoose";

const labSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  image: { type: String }, // cloudinary url
  address: { type: String },
  city: { type: String },
  phone: { type: String },
  about: { type: String },
  services: [{ type: String }], // list of services/tests
  fees: { type: Number, default: 0 }, // default or representative fee
  available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
  
});

const labModel = mongoose.model("labs", labSchema);
export default labModel;
