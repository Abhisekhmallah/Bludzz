import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const LabAppointment = () => {
  const { id } = useParams();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [lab, setLab] = useState(null);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  // 🔑 NEW: prescription state (optional)
  const [prescriptionFile, setPrescriptionFile] = useState(null);

  const { token } = useContext(AppContext);
  const navigate = useNavigate();

  const getLab = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/labs/${id}`);
      if (data.success) setLab(data.lab);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLab();
  }, [id]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!date || !time) return alert("Select date & time");

    // ⛳ IMPORTANT:
    // We do NOT upload here.
    // We pass prescription file to checkout.
    navigate("/checkout", {
      state: {
        type: "lab",
        labId: lab._id,
        labName: lab.name,
        amount: lab.fees || 0,
        date,
        time,
        prescriptionFile // ✅ passed forward
      },
    });
  };

  if (loading || !lab) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-3">
        Book Test at {lab.name}
      </h1>
      <p className="text-sm text-gray-600 mb-4">
        {lab.address} • {lab.city}
      </p>

      <form onSubmit={handleBook} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Select Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Select Time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Tests / Services</label>
          <ul className="list-disc pl-5 text-sm">
            {lab.services?.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>

        {/* ✅ OPTIONAL PRESCRIPTION UPLOAD */}
        <div>
          <label className="block text-sm mb-1">
            Upload Prescription (optional)
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setPrescriptionFile(e.target.files[0])}
          />
        </div>

        <button className="bg-primary text-white px-6 py-2 rounded-full">
          Proceed to Checkout
        </button>
      </form>
    </div>
  );
};

export default LabAppointment;
