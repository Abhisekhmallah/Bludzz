"use client"

import { createContext, useEffect, useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"

export const AppContext = createContext()

const AppContextProvider = ({ children }) => {
  const currencySymbol = "₹"
  const backendUrl = import.meta.env.VITE_BACKEND_URL

  const [doctors, setDoctors] = useState([])
  const [token, setToken] = useState(localStorage.getItem("token") || "")
  const [userData, setUserData] = useState(null)

  // ---------------- SAFETY CHECK ----------------
  if (!backendUrl) {
    console.error("❌ VITE_BACKEND_URL is not defined")
  }

  // ---------------- DOCTORS (PUBLIC, NO AUTH) ----------------
  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/doctor/list`
      )

      if (data.success) {
        setDoctors(data.doctors)
      }
    } catch (err) {
      console.error("Failed to load doctors", err)
      // ❌ No toast here — public API should fail silently
    }
  }

  // ---------------- USER PROFILE (PROTECTED) ----------------
  const loadUserProfileData = async () => {
    if (!token) return

    try {
      const { data } = await axios.get(
        `${backendUrl}/api/user/get-profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (data.success) {
        setUserData(data.userData)
      } else {
        handleInvalidToken()
      }
    } catch (err) {
      console.error(err)
      if (err.response?.status === 401) {
        handleInvalidToken()
      }
    }
  }

  const handleInvalidToken = () => {
    localStorage.removeItem("token")
    setToken("")
    setUserData(null)
  }

  // ---------------- OTP APIs ----------------
  const sendOTP = async ({ email, name, password, type }) => {
    const { data } = await axios.post(
      `${backendUrl}/api/user/send-otp`,
      { email, name, password, type }
    )
    return data
  }

  const verifyOTP = async ({ email, otp, type }) => {
    const { data } = await axios.post(
      `${backendUrl}/api/user/verify-otp`,
      { email, otp, type }
    )
    return data
  }

  const resendOTP = async ({ email }) => {
    const { data } = await axios.post(
      `${backendUrl}/api/user/resend-otp`,
      { email }
    )
    return data
  }

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    if (backendUrl) {
      getDoctorsData()
    }
  }, [backendUrl])

  useEffect(() => {
    if (token) {
      loadUserProfileData()
    } else {
      setUserData(null)
    }
  }, [token])

  // ---------------- CONTEXT VALUE ----------------
  const value = {
    currencySymbol,
    backendUrl,

    doctors,
    getDoctorsData,

    token,
    setToken,

    userData,
    setUserData,
    loadUserProfileData,

    sendOTP,
    verifyOTP,
    resendOTP,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export default AppContextProvider
