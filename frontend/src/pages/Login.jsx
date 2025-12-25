"use client"

import { useContext, useEffect, useState } from "react"
import { AppContext } from "../context/AppContext"
import axios from "axios"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"

const Login = () => {
  const [state, setState] = useState("Sign Up")
  const [showOTP, setShowOTP] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
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

  // ---------------------- LOGIC (UNTOUCHED) ----------------------

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      if (state === "Sign Up") {
        const { data } = await axios.post(backendUrl + "/api/user/send-otp", {
          name,
          email,
          password,
          type: "register",
        })

        if (data.success) {
          toast.success(data.message)
          setCurrentEmail(data.email)
          setCurrentType("register")
          setShowOTP(true)
          setOtpSent(true)
          setTimer(60)
          setCanResend(false)
        } else toast.error(data.message)
      } else {
        const { data } = await axios.post(backendUrl + "/api/user/send-otp", {
          email,
          password,
          type: "login",
        })

        if (data.success) {
          toast.success(data.message)
          setCurrentEmail(data.email)
          setCurrentType("login")
          setShowOTP(true)
          setOtpSent(true)
          setTimer(60)
          setCanResend(false)
        } else toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

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
      } else toast.error(data.message)
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP verification failed")
    } finally {
      setIsLoading(false)
    }
  }

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
      } else toast.error(data.message)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP")
    }
  }

  const handleBackToLogin = () => {
    setShowOTP(false)
    setOtpSent(false)
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
    } else if (timer === 0) setCanResend(true)
  }, [timer, showOTP])

  useEffect(() => {
    if (token) navigate("/")
  }, [token])

  // ---------------------- OTP UI ----------------------

  if (showOTP) {
    return (
      <div className="min-h-screen flex justify-center pt-6 px-4 bg-[#f4f4ff]">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">

          <div className="w-full h-28 rounded-2xl bg-gradient-to-r from-[#726bff] to-[#9e96ff] flex justify-center items-center">
            <span className="text-4xl text-white">💜</span>
          </div>

          <h2 className="text-2xl font-bold text-center mt-6">Verify Email</h2>
          <p className="text-gray-600 text-center mb-1">Enter the 6-digit OTP sent to</p>
          <p className="text-primary text-center font-medium mb-5">{currentEmail}</p>

          <form onSubmit={handleOTPVerification} className="mt-4">
            <label className="font-semibold text-sm">OTP</label>
            <input
              className="w-full mt-1 p-3 border rounded-xl text-center tracking-widest text-xl outline-none border-gray-300"
              maxLength="6"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />

            <button
              className="w-full mt-5 py-3 bg-gradient-to-r from-[#6b63ff] to-[#9b92ff] text-white rounded-xl font-semibold"
              disabled={otp.length !== 6 || isLoading}
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          <div className="text-center mt-5">
            <p className="text-gray-600">Didn't receive the code?</p>

            {canResend ? (
              <button onClick={handleResendOTP} className="text-[#6b63ff] font-semibold underline">
                Resend OTP
              </button>
            ) : (
              <p className="text-gray-500">{formatTime(timer)}</p>
            )}
          </div>

          <button
            onClick={handleBackToLogin}
            className="w-full text-center mt-6 text-gray-700 font-medium"
          >
            ← Back to {currentType === "register" ? "Sign Up" : "Login"}
          </button>
        </div>
      </div>
    )
  }

  // ---------------------- LOGIN + SIGNUP UI ----------------------

  return (
    <div className="min-h-screen flex justify-center pt-6 px-4 bg-[#f4f4ff]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">

        <div className="w-full h-28 rounded-2xl bg-gradient-to-r from-[#726bff] to-[#9e96ff] flex justify-center items-center">
          <span className="text-4xl text-white">💜</span>
        </div>

        <h2 className="text-2xl font-bold text-center mt-6">
          {state === "Sign Up" ? "Create Account" : "Welcome Back!"}
        </h2>

        <p className="text-gray-600 text-center mb-6">
          {state === "Sign Up" ? "Join and explore great features" : "Login to continue"}
        </p>

        <form onSubmit={onSubmitHandler}>

          {state === "Sign Up" && (
            <>
              <label className="font-semibold text-sm">Full Name</label>
              <input
                className="w-full mt-1 mb-4 p-3 border rounded-xl outline-none border-gray-300"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </>
          )}

          <label className="font-semibold text-sm">Email</label>
          <input
            className="w-full mt-1 mb-4 p-3 border rounded-xl outline-none border-gray-300"
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="font-semibold text-sm">Password</label>
          <input
            className="w-full mt-1 mb-5 p-3 border rounded-xl outline-none border-gray-300"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-[#6b63ff] to-[#9b92ff] text-white rounded-xl font-semibold"
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
                className="text-[#6b63ff] font-semibold ml-1 cursor-pointer underline"
                onClick={() => setState("Login")}
              >
                Login
              </span>
            </>
          ) : (
            <>
              Don't have an account?
              <span
                className="text-[#6b63ff] font-semibold ml-1 cursor-pointer underline"
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
