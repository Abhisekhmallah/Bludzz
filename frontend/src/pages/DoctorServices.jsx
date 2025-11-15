import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

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
    return <div className="p-6 text-center text-gray-500">Loading doctor details...</div>
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-2xl shadow-md mt-6">

      {/* Doctor Header */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <img
          src={doctor.image}
          alt={doctor.name}
          className="w-40 h-40 object-cover rounded-xl bg-gray-100"
        />

        <div className="flex-1 relative">

          <h2 className="text-2xl font-bold text-gray-800">{doctor.name}</h2>
          <p className="text-gray-600">{doctor.degree} - {doctor.speciality}</p>
          <p className="text-sm text-gray-500 mt-1">Experience: {doctor.experience}</p>
          <p className="text-sm text-gray-500 mt-1">{doctor.about}</p>

          {/* PHONE ICON BUTTON */}
          {doctor.phone && (
            <a
              href={`tel:${doctor.phone}`}
              className="absolute right-0 top-0 inline-flex items-center gap-2 px-3 py-2 rounded bg-white border hover:shadow"
              title={`Call ${doctor.name}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M3 5.5A2.5 2.5 0 015.5 3h1A2.5 2.5 0 019 5.5v1A2.5 2.5 0 016.5 9H6a12 12 0 0012 12v-.5A2.5 2.5 0 0019.5 18h-1A2.5 2.5 0 0016 20.5v.5" />
              </svg>

              <span className="hidden sm:inline text-sm">Call</span>
              <span className="text-sm font-medium ml-1">{doctor.phone}</span>
            </a>
          )}

        </div>
      </div>

      {/* Services Section */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Available Services</h3>

        {doctor.services && doctor.services.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {doctor.services.map((service, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition"
                onClick={() => navigate(`/appointment/${doctor._id}/${index}`)}
              >
                <h4 className="text-md font-semibold text-gray-800">{service.name}</h4>
                <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                <p className="mt-2 font-medium text-primary">
                  {currencySymbol}{service.fee || service.fees}
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
  )
}

export default DoctorServices
