import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function DoctorRegistration() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    clinicAddress: "",
    experienceYears: ""
  });

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await axios.post(
        `${API_BASE}/api/doctor/register-doctor`,
        form,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      toast.success("Doctor registration submitted!");

      setForm({
        name: "",
        email: "",
        phone: "",
        specialization: "",
        clinicAddress: "",
        experienceYears: ""
      });

    } catch (error) {
      console.error(
        "Doctor registration failed:",
        error.response?.data || error.message
      );
      toast.error("Failed to submit form");
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow p-6 mt-10 rounded">
      <h2 className="text-2xl font-semibold mb-4">Register as Doctor</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="font-medium">Full Name</label>
          <input
            name="name"
            required
            className="w-full border p-2 rounded mt-1"
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label>Email</label>
            <input
              name="email"
              required
              type="email"
              className="w-full border p-2 rounded mt-1"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Phone</label>
            <input
              name="phone"
              required
              className="w-full border p-2 rounded mt-1"
              value={form.phone}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label>Specialization</label>
          <input
            name="specialization"
            required
            className="w-full border p-2 rounded mt-1"
            value={form.specialization}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Clinic Address</label>
          <textarea
            name="clinicAddress"
            required
            className="w-full border p-2 rounded mt-1"
            value={form.clinicAddress}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Experience (Years)</label>
          <input
            type="number"
            name="experienceYears"
            required
            className="w-full border p-2 rounded mt-1"
            value={form.experienceYears}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Submit
        </button>

      </form>
    </div>
  );
}
