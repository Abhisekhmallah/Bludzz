import React, { useContext, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AppContext } from "../context/AppContext"

const DoctorServices = () => {
  const { docId } = useParams()
  const { doctors, currencySymbol } = useContext(AppContext)
  const [doctor, setDoctor] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const foundDoctor = doctors.find((doc) => doc._id === docId)
    setDoctor(foundDoctor)
  }, [doctors, docId])

  if (!doctor) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading doctor details...
      </div>
    )
  }

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow border p-5">

        {/* ================= DOCTOR HEADER ================= */}
        <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">

          {/* IMAGE */}
          <img
            src={doctor.image}
            alt={doctor.name}
            className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-2xl bg-gray-100"
          />

          {/* INFO */}
          <div className="flex-1 w-full">

            {/* NAME */}
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 text-center sm:text-left">
              {doctor.name}
            </h2>

            {/* DEGREE & SPECIALITY */}
            <p className="text-gray-600 text-sm sm:text-base mt-1 text-center sm:text-left">
              {doctor.degree} • {doctor.speciality}
            </p>

            {/* EXPERIENCE */}
            <p className="text-sm text-gray-500 mt-1 text-center sm:text-left">
              Experience: {doctor.experience}
            </p>

            {/* CALL BUTTON — MOBILE SAFE */}
            {doctor.phone && (
              <div className="mt-3 flex justify-center sm:justify-start">
                <a
                  href={`tel:${doctor.phone}`}
                  className="
                    inline-flex items-center gap-2
                    px-4 py-2
                    rounded-xl
                    border
                    text-sm font-medium
                    text-gray-700
                    hover:bg-gray-50
                  "
                >
                  📞 {doctor.phone}
                </a>
              </div>
            )}

            {/* ABOUT */}
            {doctor.about && (
              <p className="text-sm text-gray-600 mt-4 text-center sm:text-left">
                {doctor.about}
              </p>
            )}
          </div>
        </div>

        {/* ================= SERVICES ================= */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Available Services
          </h3>

          {doctor.services && doctor.services.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {doctor.services.map((service, index) => (
                <div
                  key={index}
                  className="
                    border rounded-xl p-4
                    cursor-pointer
                    hover:shadow-md
                    transition
                  "
                  onClick={() =>
                    navigate(`/appointment/${doctor._id}/${index}`)
                  }
                >
                  <h4 className="font-medium text-gray-800">
                    {service.name}
                  </h4>

                  {service.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {service.description}
                    </p>
                  )}

                  <p className="mt-3 font-semibold text-primary">
                    {currencySymbol}
                    {service.fee || service.fees}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              No specific services available. You can book a general appointment.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorServices
