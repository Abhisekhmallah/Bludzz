import React, { useState, useContext } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { AppContext } from "../context/AppContext"

export default function DoctorRegistration() {
  const { backendUrl } = useContext(AppContext)

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    clinicAddress: "",
    experienceYears: "",
  })

  const [document, setDocument] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleFileChange(e) {
    setDocument(e.target.files[0])
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!document) {
      toast.error("Please upload your medical registration document")
      return
    }

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append("name", form.name)
      formData.append("email", form.email)
      formData.append("phone", form.phone)
      formData.append("specialization", form.specialization)
      formData.append("clinicAddress", form.clinicAddress)
      formData.append("experienceYears", form.experienceYears)
      formData.append("document", document)

      const { data } = await axios.post(
        `${backendUrl}/api/doctor/register-doctor`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

      if (data.success) {
        toast.success("Doctor registration submitted successfully!")

        setForm({
          name: "",
          email: "",
          phone: "",
          specialization: "",
          clinicAddress: "",
          experienceYears: "",
        })

        setDocument(null)
      } else {
        toast.error(data.message || "Registration failed")
      }

    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to submit form. Please try again."

      console.error("Doctor registration failed:", message)
      toast.error(message)
    } finally {
      setLoading(false)
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

        {/* 🔥 DOCUMENT UPLOAD */}
        <div>
          <label className="font-medium">
            Upload Medical Registration Certificate (PDF/Image)
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            required
            className="w-full border p-2 rounded mt-1"
            onChange={handleFileChange}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          } text-white px-4 py-2 rounded transition`}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>

      </form>
    </div>
  )
}
