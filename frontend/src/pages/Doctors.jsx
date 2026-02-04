import React, { useContext, useEffect } from "react"
import { AppContext } from "../context/AppContext"

const DoctorDetails = ({ doctor }) => {
  if (!doctor) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white rounded-2xl border p-5">

        {/* ================= IMAGE ================= */}
        <div className="flex justify-center">
          <img
            src={doctor.image}
            alt={doctor.name}
            className="w-32 h-32 rounded-2xl object-cover bg-gray-100"
          />
        </div>

        {/* ================= NAME + CALL (FIXED) ================= */}
        <div
          className="
            mt-4
            flex flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-3
            text-center
            sm:text-left
          "
        >
          {/* Doctor Name */}
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 break-words">
            {doctor.name}
          </h1>

          {/* Call Button */}
          {doctor.phone && (
            <a
              href={`tel:${doctor.phone}`}
              className="
                inline-flex items-center justify-center gap-2
                px-4 py-2
                border rounded-xl
                text-sm font-medium
                text-gray-700
                hover:bg-gray-50
                w-full sm:w-auto
              "
            >
              📞 {doctor.phone}
            </a>
          )}
        </div>

        {/* ================= META ================= */}
        <div className="mt-2 text-center sm:text-left">
          <p className="text-sm text-gray-500">
            {doctor.speciality}
          </p>
          <p className="text-sm text-gray-600">
            Experience: {doctor.experience}
          </p>
        </div>

        {/* ================= ABOUT ================= */}
        {doctor.about && (
          <p className="mt-4 text-sm text-gray-600">
            {doctor.about}
          </p>
        )}

        {/* ================= SERVICES ================= */}
        {doctor.services?.length > 0 && (
          <div className="mt-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3">
              Available Services
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {doctor.services.map((service, index) => (
                <div
                  key={index}
                  className="border rounded-xl p-4 bg-gray-50"
                >
                  <p className="font-medium text-gray-800">
                    {service.name}
                  </p>

                  {service.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {service.description}
                    </p>
                  )}

                  <p className="text-primary font-semibold mt-3">
                    ₹{service.fee}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default DoctorDetails
