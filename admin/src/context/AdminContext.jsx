import axios from "axios"
import { createContext, useState } from "react"
import { toast } from "react-toastify"

export const AdminContext = createContext()

const AdminContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL

  const [aToken, setAToken] = useState(
    localStorage.getItem("aToken") || ""
  )

  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [labs, setLabs] = useState([])
  const [dashData, setDashData] = useState(false)

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${aToken}`,
    },
  }

  // ---------------- DOCTORS ----------------
  const getAllDoctors = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/admin/all-doctors`,
        authHeaders
      )
      if (data.success) {
        setDoctors(data.doctors)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to load doctors")
    }
  }

  const changeAvailability = async (docId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/change-availability`,
        { docId },
        authHeaders
      )
      if (data.success) {
        toast.success(data.message)
        getAllDoctors()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to update availability")
    }
  }

  // ---------------- LABS ----------------
  const getAllLabs = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/admin/all-labs`,
        authHeaders
      )
      if (data.success) {
        setLabs(data.labs)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to load labs")
    }
  }

  const changeLabAvailability = async (id) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/change-lab-availability`,
        { id },
        authHeaders
      )
      if (data.success) {
        toast.success(data.message)
        getAllLabs()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to update lab availability")
    }
  }

  // ---------------- APPOINTMENTS ----------------
  const getAllAppointments = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/admin/appointments`,
        authHeaders
      )
      if (data.success) {
        setAppointments(data.appointments.reverse())
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to load appointments")
    }
  }

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/cancel-appointment`,
        { appointmentId },
        authHeaders
      )

      if (data.success) {
        toast.success(data.message)
        getAllAppointments()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to cancel appointment")
    }
  }

  // ---------------- DASHBOARD ----------------
  const getDashData = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/admin/dashboard`,
        authHeaders
      )

      if (data.success) {
        setDashData(data.dashData)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to load dashboard")
    }
  }

  const value = {
    aToken,
    setAToken,

    doctors,
    getAllDoctors,
    changeAvailability,

    labs,
    getAllLabs,
    changeLabAvailability,

    appointments,
    getAllAppointments,
    cancelAppointment,

    dashData,
    getDashData,
  }

  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  )
}

export default AdminContextProvider
