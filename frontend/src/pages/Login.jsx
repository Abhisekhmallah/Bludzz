"use client"

import { useContext, useEffect, useState } from "react"
import { AppContext } from "../context/AppContext"
import axios from "axios"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"

const Login = () => {
  const [state, setState] = useState("Sign Up")
  const [showOTP, setShowOTP] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [currentEmail, setCurrentEmail] = useState("")
  const [currentType, setCurrentType] = useState("")
  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)

  const navigate = useNavigate()
  const { backendUrl, token, setToken } = useContext(AppContext)

  // ---------------- SEND OTP (EMAIL ONLY) ----------------
  const onSubmitHandler = async (event) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      const { data } = await axios.post(backendUrl + "/api/user/send-otp", {
        name,
        email,
        password,
        type: state === "Sign Up" ? "register" : "login",
      })

      if (!data.success) {
        toast.error(data.message)
        return
      }

      toast.success("OTP sent to your email")

      setCurrentEmail(data.email)
      setCurrentType(state === "Sign Up" ? "register" : "login")
      setShowOTP(true)
      setTimer(60)
      setCanResend(false)

    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  // ---------------- VERIFY OTP ----------------
  const handleOTPVerification = async (event) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      const { data } = await axios.post(backendUrl + "/api/user/verify-otp", {
        email: currentEmail,
        otp,
        type: currentType,
      })

      if (data.success) {
        toast.success(data.message)
        localStorage.setItem("token", data.token)
        setToken(data.token)
        setShowOTP(false)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP verification failed")
    } finally {
      setIsLoading(false)
    }
  }

  // ---------------- RESEND OTP ----------------
  const handleResendOTP = async () => {
    try {
      const { data } = await axios.post(backendUrl + "/api/user/resend-otp", {
        email: currentEmail,
      })

      if (data.success) {
        toast.success(data.message)
        setTimer(60)
        setCanResend(false)
        setOtp("")
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP")
    }
  }

  const handleBackToLogin = () => {
    setShowOTP(false)
    setCurrentEmail("")
    setCurrentType("")
    setOtp("")
    setTimer(60)
    setCanResend(false)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  useEffect(() => {
    if (timer > 0 && showOTP) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000)
      return () => clearInterval(interval)
    } else if (timer === 0) {
      setCanResend(true)
    }
  }, [timer, showOTP])

  useEffect(() => {
    if (token) navigate("/")
  }, [token])

  // ---------------- OTP UI ----------------
  if (showOTP) {
    return (
      <div className="min-h-screen flex justify-center pt-6 px-4 bg-[#f4f4ff]">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">

          <h2 className="text-2xl font-bold text-center mt-6">Verify Email</h2>
          <p className="text-gray-600 text-center mb-5">
            Enter the OTP sent to {currentEmail}
          </p>

          <form onSubmit={handleOTPVerification}>
            <input
              className="w-full p-3 border rounded-xl text-center text-xl"
              maxLength="6"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />

            <button
              className="w-full mt-4 py-3 bg-[#6b63ff] text-white rounded-xl"
              disabled={otp.length !== 6 || isLoading}
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          <div className="text-center mt-4">
            {canResend ? (
              <button onClick={handleResendOTP} className="text-[#6b63ff] underline">
                Resend OTP
              </button>
            ) : (
              <p>{formatTime(timer)}</p>
            )}
          </div>

          <button
            onClick={handleBackToLogin}
            className="w-full mt-4 text-gray-600"
          >
            ← Back
          </button>
        </div>
      </div>
    )
  }

  // ---------------- LOGIN / SIGNUP UI ----------------
  return (
    <div className="min-h-screen flex justify-center pt-6 px-4 bg-[#f4f4ff]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">

        <h2 className="text-2xl font-bold text-center mt-6">
          {state === "Sign Up" ? "Create Account" : "Welcome Back"}
        </h2>

        <form onSubmit={onSubmitHandler}>
          {state === "Sign Up" && (
            <input
              className="w-full mb-4 p-3 border rounded-xl"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <input
            className="w-full mb-4 p-3 border rounded-xl"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="w-full mb-4 p-3 border rounded-xl"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full py-3 bg-[#6b63ff] text-white rounded-xl"
          >
            {isLoading
              ? "Sending OTP..."
              : state === "Sign Up"
              ? "Send OTP"
              : "Login with OTP"}
          </button>
        </form>

        <p className="text-center mt-4">
          {state === "Sign Up" ? (
            <>
              Already have an account?
              <span
                className="ml-1 text-[#6b63ff] underline cursor-pointer"
                onClick={() => setState("Login")}
              >
                Login
              </span>
            </>
          ) : (
            <>
              Don’t have an account?
              <span
                className="ml-1 text-[#6b63ff] underline cursor-pointer"
                onClick={() => setState("Sign Up")}
              >
                Sign Up
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  )
}

export default Login
